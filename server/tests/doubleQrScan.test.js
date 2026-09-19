import { test } from "node:test";
import assert from "node:assert/strict";
import { createStudent, createVendorWithItem, creditStudent } from "./helpers/fixtures.js";
import { login, apiFetch } from "./helpers/client.js";

async function advance(vendorCookie, orderId, status) {
  const res = await apiFetch(`/api/vendor/orders/${orderId}/status`, {
    method: "PATCH",
    cookie: vendorCookie,
    body: { status },
  });
  assert.equal(res.status, 200, `expected ${status} transition to succeed`);
}

test("a second scan of an already-collected order/code returns 'Already collected'", async () => {
  const student = await createStudent();
  await creditStudent(student.id, 100);
  const { vendor, item, user: vendorUser } = await createVendorWithItem({ price: 10, stock: 5 });

  const { cookie: studentCookie } = await login(student.email, student.password);
  const { cookie: vendorCookie } = await login(vendorUser.email, vendorUser.password);

  const placed = await apiFetch("/api/orders", {
    method: "POST",
    cookie: studentCookie,
    body: {
      vendorId: vendor.id,
      items: [{ menuItemId: item.id, quantity: 1 }],
      pickupTime: new Date().toISOString(),
    },
  });
  assert.equal(placed.status, 201);
  const orderId = placed.body.order.id;

  await advance(vendorCookie, orderId, "ACCEPTED");
  await advance(vendorCookie, orderId, "PREPARING");
  await advance(vendorCookie, orderId, "READY");

  const pickup = await apiFetch(`/api/orders/${orderId}/pickup`, { cookie: studentCookie });
  assert.equal(pickup.status, 200);
  const { pickupToken } = pickup.body;

  const firstScan = await apiFetch("/api/vendor/orders/verify", {
    method: "POST",
    cookie: vendorCookie,
    body: { code: pickupToken },
  });
  assert.equal(firstScan.status, 200);
  assert.equal(firstScan.body.order.status, "COLLECTED");

  const secondScan = await apiFetch("/api/vendor/orders/verify", {
    method: "POST",
    cookie: vendorCookie,
    body: { code: pickupToken },
  });
  assert.equal(secondScan.status, 409);
  assert.match(secondScan.body.error, /already collected/i);

  // The backup code for the same order must also report the same thing.
  const backupScan = await apiFetch("/api/vendor/orders/verify", {
    method: "POST",
    cookie: vendorCookie,
    body: { code: pickup.body.backupCode },
  });
  assert.equal(backupScan.status, 409);
  assert.match(backupScan.body.error, /already collected/i);
});

test("concurrent double-scan of the same code: exactly one wins", async () => {
  const student = await createStudent();
  await creditStudent(student.id, 100);
  const { vendor, item, user: vendorUser } = await createVendorWithItem({ price: 10, stock: 5 });

  const { cookie: studentCookie } = await login(student.email, student.password);
  const { cookie: vendorCookie } = await login(vendorUser.email, vendorUser.password);

  const placed = await apiFetch("/api/orders", {
    method: "POST",
    cookie: studentCookie,
    body: {
      vendorId: vendor.id,
      items: [{ menuItemId: item.id, quantity: 1 }],
      pickupTime: new Date().toISOString(),
    },
  });
  const orderId = placed.body.order.id;
  await advance(vendorCookie, orderId, "ACCEPTED");
  await advance(vendorCookie, orderId, "PREPARING");
  await advance(vendorCookie, orderId, "READY");

  const pickup = await apiFetch(`/api/orders/${orderId}/pickup`, { cookie: studentCookie });
  const { backupCode } = pickup.body;

  const [scan1, scan2] = await Promise.all([
    apiFetch("/api/vendor/orders/verify", { method: "POST", cookie: vendorCookie, body: { code: backupCode } }),
    apiFetch("/api/vendor/orders/verify", { method: "POST", cookie: vendorCookie, body: { code: backupCode } }),
  ]);

  const statuses = [scan1.status, scan2.status].sort();
  assert.deepEqual(statuses, [200, 409]);
});
