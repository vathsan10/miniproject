import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { generateBackupCode } from "../lib/backupCode.js";
import { getBalance } from "./wallet.service.js";

// Places an order as a single atomic transaction:
//   (a) check the student's ledger balance >= total,
//   (b) for each item, decrement stock with a conditional update (only
//       if stock >= quantity) - if any item fails, the whole
//       transaction rolls back, so a checkout can never partially
//       succeed (e.g. debit stock for item A but fail on item B),
//   (c) create the Order + OrderItems, snapshotting priceAtOrder so a
//       later menu price change never changes a past order's total,
//   (d) create a PURCHASE transaction.
//
// The conditional stock update is what prevents overselling: if two
// students race for the last unit, the updateMany's `stock >= quantity`
// predicate only matches for whichever request's UPDATE statement runs
// first, so the second gets a decremented count of 0 and fails cleanly
// instead of taking stock negative.
//
// Prices and the total are never taken from the frontend - both are
// recomputed here from the current MenuItem rows.
//
// Note on the balance check: SQLite (this project's dev database) only
// ever runs one write transaction at a time, so reading the balance and
// debiting it here are effectively serialized already. Moving to
// Postgres in production would additionally want row-level locking
// (e.g. `SELECT ... FOR UPDATE` on the student's transactions) to keep
// this fully race-free under READ COMMITTED.
export async function placeOrder({ studentId, vendorId, items, pickupTime }) {
  return prisma.$transaction(async (tx) => {
    const vendor = await tx.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor || !vendor.isOpen) {
      throw new HttpError(400, "This vendor isn't open right now");
    }

    const menuItemIds = items.map((line) => line.menuItemId);
    const menuItems = await tx.menuItem.findMany({ where: { id: { in: menuItemIds } } });
    if (menuItems.length !== menuItemIds.length) {
      throw new HttpError(400, "One or more items are no longer available");
    }

    let total = 0;
    const orderItemsData = [];
    for (const line of items) {
      const menuItem = menuItems.find((m) => m.id === line.menuItemId);
      if (menuItem.vendorId !== vendorId) {
        throw new HttpError(400, "All items in an order must be from the same vendor");
      }
      if (!menuItem.isAvailable) {
        throw new HttpError(400, `${menuItem.name} is not available`);
      }

      const decremented = await tx.menuItem.updateMany({
        where: { id: menuItem.id, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (decremented.count === 0) {
        throw new HttpError(409, `Not enough stock left for ${menuItem.name}`);
      }

      total += menuItem.price * line.quantity;
      orderItemsData.push({
        menuItemId: menuItem.id,
        quantity: line.quantity,
        priceAtOrder: menuItem.price,
      });
    }

    const balance = await getBalance(studentId, tx);
    if (balance < total) {
      throw new HttpError(400, "Insufficient balance");
    }

    const order = await tx.order.create({
      data: {
        studentId,
        vendorId,
        total,
        pickupTime,
        backupCode: generateBackupCode(),
        items: { create: orderItemsData },
      },
      include: { items: { include: { menuItem: true } }, vendor: { select: { shopName: true } } },
    });

    await tx.transaction.create({
      data: { userId: studentId, type: "PURCHASE", amount: total, reference: order.id },
    });

    return order;
  });
}

// Shared by student cancellation (Phase 5) and vendor rejection
// (Phase 6): restores each line's stock and refunds the full order
// total, in the same transaction as the status change.
export async function restoreStockAndRefund(tx, order, newStatus) {
  for (const item of order.items) {
    await tx.menuItem.update({
      where: { id: item.menuItemId },
      data: { stock: { increment: item.quantity } },
    });
  }

  const updated = await tx.order.update({ where: { id: order.id }, data: { status: newStatus } });

  await tx.transaction.create({
    data: { userId: order.studentId, type: "REFUND", amount: order.total, reference: order.id },
  });

  return updated;
}

// Students may only cancel while the order is still PLACED (i.e. before
// the vendor has started acting on it).
export async function cancelOrder({ orderId, studentId }) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || order.studentId !== studentId) {
      throw new HttpError(404, "Order not found");
    }
    if (order.status !== "PLACED") {
      throw new HttpError(400, "Only orders that haven't been accepted yet can be cancelled");
    }
    return restoreStockAndRefund(tx, order, "CANCELLED");
  });
}
