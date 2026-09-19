import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma.js";
import { createStudent, createVendorWithItem } from "./helpers/fixtures.js";
import { login, apiFetch } from "./helpers/client.js";

test("checkout is rejected when balance is insufficient, with no partial side effects", async () => {
  const student = await createStudent(); // balance stays 0 - no top-up
  const { vendor, item } = await createVendorWithItem({ price: 50, stock: 10 });

  const { cookie } = await login(student.email, student.password);

  const res = await apiFetch("/api/orders", {
    method: "POST",
    cookie,
    body: {
      vendorId: vendor.id,
      items: [{ menuItemId: item.id, quantity: 1 }],
      pickupTime: new Date().toISOString(),
    },
  });

  assert.equal(res.status, 400);
  assert.match(res.body.error, /insufficient balance/i);

  // The transaction must roll back completely: no order created, no
  // stock decremented (even though stock is decremented before the
  // balance check runs, inside the same $transaction), no PURCHASE
  // transaction recorded.
  const orderCount = await prisma.order.count({ where: { studentId: student.id } });
  assert.equal(orderCount, 0);

  const freshItem = await prisma.menuItem.findUnique({ where: { id: item.id } });
  assert.equal(freshItem.stock, 10);

  const txnCount = await prisma.transaction.count({ where: { userId: student.id } });
  assert.equal(txnCount, 0);
});
