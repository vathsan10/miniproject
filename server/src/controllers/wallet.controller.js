import crypto from "node:crypto";
import { v4 as uuid } from "uuid";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { razorpay, isRazorpayConfigured, razorpayKeyId, razorpayKeySecret } from "../lib/razorpay.js";
import { getBalance, listTransactions, creditTopup } from "../services/wallet.service.js";

export async function balance(req, res) {
  res.json({ balance: await getBalance(req.user.id) });
}

export async function transactions(req, res) {
  res.json({ transactions: await listTransactions(req.user.id) });
}

export async function topupInit(req, res) {
  const { amount } = req.body;

  if (isRazorpayConfigured) {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay amounts are in paise
      currency: "INR",
      receipt: `unipay_${Date.now()}`,
    });
    const intent = await prisma.paymentIntent.create({
      data: { userId: req.user.id, amount, gatewayOrderId: order.id },
    });
    return res.json({
      mode: "razorpay",
      keyId: razorpayKeyId,
      orderId: order.id,
      amount,
      paymentIntentId: intent.id,
    });
  }

  // Mock mode: no external gateway is involved, but it still goes through
  // the same PaymentIntent + verify flow real payments use, so the demo
  // exercises identical backend logic either way.
  const intent = await prisma.paymentIntent.create({
    data: { userId: req.user.id, amount, gatewayOrderId: `mock_${uuid()}` },
  });
  res.json({ mode: "mock", amount, paymentIntentId: intent.id });
}

export async function topupVerify(req, res) {
  const { paymentIntentId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  const intent = await prisma.paymentIntent.findUnique({ where: { id: paymentIntentId } });
  if (!intent) throw new HttpError(404, "Payment not found");
  if (intent.userId !== req.user.id) throw new HttpError(403, "This payment doesn't belong to you");

  let paymentId;
  if (isRazorpayConfigured) {
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      throw new HttpError(400, "Missing payment verification fields");
    }
    if (razorpay_order_id !== intent.gatewayOrderId) {
      throw new HttpError(400, "Payment does not match this top-up request");
    }
    // The signature is the actual proof the payment happened - a frontend
    // "success" callback alone can be spoofed, this cannot (it requires
    // the key secret, which never reaches the browser).
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expectedSignature !== razorpay_signature) {
      throw new HttpError(400, "Payment verification failed");
    }
    paymentId = razorpay_payment_id;
  } else {
    // Deterministic per-intent id so a retried mock verify call is
    // idempotent through the same unique-constraint path real payments use.
    paymentId = `mock_${intent.id}`;
  }

  const result = await creditTopup({ paymentIntentId: intent.id, userId: req.user.id, paymentId });
  res.json({
    ok: true,
    alreadyCredited: result.alreadyCredited,
    balance: await getBalance(req.user.id),
  });
}
