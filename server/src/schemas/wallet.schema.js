import { z } from "zod";

export const topupInitSchema = z.object({
  amount: z.number().int("Amount must be a whole number").min(10).max(5000),
});

export const topupVerifySchema = z.object({
  paymentIntentId: z.string().min(1),
  // Present only in real Razorpay mode; absent in mock mode.
  razorpay_payment_id: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
});
