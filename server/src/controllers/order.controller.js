import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { placeOrder, cancelOrder } from "../services/order.service.js";
import { emitNewOrder, emitOrderUpdate } from "../lib/socket.js";

export async function checkout(req, res) {
  const { vendorId, items, pickupTime } = req.body;
  const order = await placeOrder({ studentId: req.user.id, vendorId, items, pickupTime });
  emitNewOrder(order);
  res.status(201).json({ order });
}

export async function myOrders(req, res) {
  const orders = await prisma.order.findMany({
    where: { studentId: req.user.id },
    include: {
      items: { include: { menuItem: { select: { name: true } } } },
      vendor: { select: { shopName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ orders });
}

export async function cancel(req, res) {
  const order = await cancelOrder({ orderId: req.params.id, studentId: req.user.id });
  emitOrderUpdate(order);
  res.json({ order });
}

// The QR code must encode only pickupToken (never the order id), and
// both it and the backup code are only ever handed to the student once
// the order is actually READY for collection.
export async function pickup(req, res) {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.studentId !== req.user.id) {
    throw new HttpError(404, "Order not found");
  }
  if (order.status !== "READY") {
    throw new HttpError(400, "Pickup code is only available once the order is ready");
  }
  res.json({ pickupToken: order.pickupToken, backupCode: order.backupCode });
}
