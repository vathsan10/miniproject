import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";

// The wallet has no stored balance column (see schema.prisma) - it is
// always recomputed from the ledger so it can never drift from what
// actually happened.
export async function getBalance(userId) {
  const totals = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId },
    _sum: { amount: true },
  });
  const sum = (type) => totals.find((t) => t.type === type)?._sum.amount || 0;
  return sum("TOPUP") + sum("REFUND") - sum("PURCHASE");
}

export function listTransactions(userId) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

// Credits a verified top-up exactly once, even if verify is called twice
// for the same payment (e.g. the client retries after a dropped response,
// or a Razorpay webhook and the checkout handler both fire).
export async function creditTopup({ paymentIntentId, userId, paymentId }) {
  try {
    return await prisma.$transaction(async (tx) => {
      const intent = await tx.paymentIntent.findUnique({ where: { id: paymentIntentId } });
      if (!intent) throw new HttpError(404, "Payment not found");
      if (intent.status === "PAID") return { alreadyCredited: true };

      // Conditional update on status=CREATED closes the race window: if
      // two verify calls run concurrently for the same intent, only one
      // can flip CREATED -> PAID, so only one can pass this gate.
      const updated = await tx.paymentIntent.updateMany({
        where: { id: paymentIntentId, status: "CREATED" },
        data: { status: "PAID", paymentId },
      });
      if (updated.count === 0) return { alreadyCredited: true };

      await tx.transaction.create({
        data: { userId, type: "TOPUP", amount: intent.amount, reference: paymentId },
      });
      return { alreadyCredited: false, amount: intent.amount };
    });
  } catch (err) {
    // paymentId carries a unique constraint (schema.prisma), so even if
    // the same real payment somehow reaches this path twice under two
    // different PaymentIntent rows, the second write fails here instead
    // of crediting twice.
    if (err.code === "P2002") {
      return { alreadyCredited: true };
    }
    throw err;
  }
}
