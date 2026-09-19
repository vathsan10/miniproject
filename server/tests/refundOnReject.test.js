import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma.js";
import { createStudent, createVendorWithItem, creditStudent } from "./helpers/fixtures.js";
import { login, apiFetch } from "./helpers/client.js";

test("rejecting an order refunds the student and restores stock", async () => {
  const student = await createStudent();
  await creditStudent(student.id, 200);
  const { vendor, item, user: vendorUser } = await createVendorWithItem({ price: 30, stock: 10 });

  const { cookie: studentCookie } = await login(student.email, student.password);
  const { cookie: vendorCookie } = await login(vendorUser.email, vendorUser.password);

  const placed = await apiFetch("/api/orders", {
    method: "POST",
    cookie: studentCookie,
    body: {
      vendorId: vendor.id,
      items: [{ menuItemId: item.id, quantity: 2 }],
      pickupTime: new Date().toISOString(),
    },
  });
  assert.equal(placed.status, 201);
  const orderId = placed.body.order.id;

  const balanceAfterOrder = await apiFetch("/api/wallet/balance", { cookie: studentCookie });
  assert.equal(balanceAfterOrder.body.balance, 140); // 200 - 2*30

  const stockAfterOrder = await prisma.menuItem.findUnique({ where: { id: item.id } });
  assert.equal(stockAfterOrder.stock, 8); // 10 - 2

  const reject = await apiFetch(`/api/vendor/orders/${orderId}/status`, {
    method: "PATCH",
    cookie: vendorCookie,
    body: { status: "REJECTED" },
  });
  assert.equal(reject.status, 200);
  assert.equal(reject.body.order.status, "REJECTED");

  const balanceAfterReject = await apiFetch("/api/wallet/balance", { cookie: studentCookie });
  assert.equal(balanceAfterReject.body.balance, 200, "full amount should be refunded");

  const stockAfterReject = await prisma.menuItem.findUnique({ where: { id: item.id } });
  assert.equal(stockAfterReject.stock, 10, "stock should be fully restored");

  const refundTxn = await prisma.transaction.findFirst({
    where: { userId: student.id, type: "REFUND", reference: orderId },
  });
  assert.ok(refundTxn, "a REFUND transaction should exist");
  assert.equal(refundTxn.amount, 60);

  // Rejected orders shouldn't appear in the vendor's active dashboard list.
  const activeOrders = await apiFetch("/api/vendor/orders", { cookie: vendorCookie });
  assert.ok(!activeOrders.body.orders.some((o) => o.id === orderId));
});
