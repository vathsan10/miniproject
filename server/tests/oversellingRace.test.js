import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma.js";
import { createStudent, createVendorWithItem, creditStudent } from "./helpers/fixtures.js";
import { login, apiFetch } from "./helpers/client.js";

test("two concurrent checkouts for the last unit of stock: exactly one succeeds", async () => {
  const { vendor, item } = await createVendorWithItem({ price: 10, stock: 1 });

  const studentA = await createStudent();
  const studentB = await createStudent();
  await creditStudent(studentA.id, 100);
  await creditStudent(studentB.id, 100);

  const [{ cookie: cookieA }, { cookie: cookieB }] = await Promise.all([
    login(studentA.email, studentA.password),
    login(studentB.email, studentB.password),
  ]);

  const orderBody = {
    vendorId: vendor.id,
    items: [{ menuItemId: item.id, quantity: 1 }],
    pickupTime: new Date().toISOString(),
  };

  const [resA, resB] = await Promise.all([
    apiFetch("/api/orders", { method: "POST", cookie: cookieA, body: orderBody }),
    apiFetch("/api/orders", { method: "POST", cookie: cookieB, body: orderBody }),
  ]);

  const statuses = [resA.status, resB.status].sort();
  assert.deepEqual(statuses, [201, 409], "exactly one request should succeed (201) and the other fail (409)");

  const failed = resA.status === 409 ? resA : resB;
  assert.match(failed.body.error, /not enough stock/i);

  // Stock must land at exactly 0, never negative, and only one order
  // should have actually been created between the two students.
  const freshItem = await prisma.menuItem.findUnique({ where: { id: item.id } });
  assert.equal(freshItem.stock, 0);

  const orderCount = await prisma.order.count({
    where: { studentId: { in: [studentA.id, studentB.id] } },
  });
  assert.equal(orderCount, 1);
});
