import { prisma } from "../lib/prisma.js";
import { updateOrderStatus } from "../services/order.service.js";
import { emitOrderUpdate } from "../lib/socket.js";

const ACTIVE_STATUSES = ["PLACED", "ACCEPTED", "PREPARING", "READY"];

export async function listOrders(req, res) {
  const orders = await prisma.order.findMany({
    where: { vendorId: req.vendor.id, status: { in: ACTIVE_STATUSES } },
    include: {
      items: { include: { menuItem: { select: { name: true } } } },
      student: { select: { name: true, rollNo: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  res.json({ orders });
}

export async function updateStatus(req, res) {
  const order = await updateOrderStatus({
    orderId: req.params.id,
    vendorId: req.vendor.id,
    newStatus: req.body.status,
  });
  emitOrderUpdate(order);
  res.json({ order });
}
