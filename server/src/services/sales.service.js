import { prisma } from "../lib/prisma.js";

// REJECTED/CANCELLED orders were fully refunded, so they contribute
// nothing to revenue or item counts - everything else (including still
// in-progress orders) already debited the student and counts as earned.
function isCounted(order) {
  return order.status !== "REJECTED" && order.status !== "CANCELLED";
}

export async function getTodaySummary(vendorId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { vendorId, createdAt: { gte: startOfDay } },
    include: { items: { include: { menuItem: { select: { name: true } } } } },
  });

  const counted = orders.filter(isCounted);
  const creditsEarned = counted.reduce((sum, o) => sum + o.total, 0);

  const itemTotals = new Map();
  for (const order of counted) {
    for (const item of order.items) {
      const existing = itemTotals.get(item.menuItemId) || { name: item.menuItem.name, quantity: 0 };
      existing.quantity += item.quantity;
      itemTotals.set(item.menuItemId, existing);
    }
  }
  const topItems = [...itemTotals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  return {
    ordersCount: orders.length,
    creditsEarned,
    topItems,
  };
}
