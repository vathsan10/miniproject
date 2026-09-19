import { prisma } from "../lib/prisma.js";
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
