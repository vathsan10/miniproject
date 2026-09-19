import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma.js";
import { createStudent } from "./helpers/fixtures.js";
import { login, apiFetch } from "./helpers/client.js";

test("verifying the same top-up payment twice credits the wallet only once", async () => {
  const student = await createStudent();
  const { cookie } = await login(student.email, student.password);

  const init = await apiFetch("/api/wallet/topup/init", {
    method: "POST",
    cookie,
    body: { amount: 100 },
  });
  assert.equal(init.status, 200);
  assert.equal(init.body.mode, "mock", "test server runs with no Razorpay keys configured");
  const { paymentIntentId } = init.body;

  const firstVerify = await apiFetch("/api/wallet/topup/verify", {
    method: "POST",
    cookie,
    body: { paymentIntentId },
  });
  assert.equal(firstVerify.status, 200);
  assert.equal(firstVerify.body.alreadyCredited, false);
  assert.equal(firstVerify.body.balance, 100);

  // Simulates a retried request (e.g. a dropped response, or the
  // checkout handler firing twice) for the exact same payment.
  const secondVerify = await apiFetch("/api/wallet/topup/verify", {
    method: "POST",
    cookie,
    body: { paymentIntentId },
  });
  assert.equal(secondVerify.status, 200);
  assert.equal(secondVerify.body.alreadyCredited, true);
  assert.equal(secondVerify.body.balance, 100, "balance must not be credited a second time");

  const topupCount = await prisma.transaction.count({
    where: { userId: student.id, type: "TOPUP" },
  });
  assert.equal(topupCount, 1, "only one TOPUP transaction should exist");
});

test("concurrent double-verify of the same payment: balance is credited only once", async () => {
  const student = await createStudent();
  const { cookie } = await login(student.email, student.password);

  const init = await apiFetch("/api/wallet/topup/init", {
    method: "POST",
    cookie,
    body: { amount: 250 },
  });
  const { paymentIntentId } = init.body;

  const [res1, res2] = await Promise.all([
    apiFetch("/api/wallet/topup/verify", { method: "POST", cookie, body: { paymentIntentId } }),
    apiFetch("/api/wallet/topup/verify", { method: "POST", cookie, body: { paymentIntentId } }),
  ]);

  const alreadyCreditedFlags = [res1.body.alreadyCredited, res2.body.alreadyCredited].sort();
  assert.deepEqual(alreadyCreditedFlags, [false, true]);

  const balance = await apiFetch("/api/wallet/balance", { cookie });
  assert.equal(balance.body.balance, 250);
});
