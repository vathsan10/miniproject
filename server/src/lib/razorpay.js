import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// Demo must always work even without a Razorpay account: if keys are
// absent, every top-up call site below falls back to Mock Payment mode.
export const isRazorpayConfigured = Boolean(keyId && keySecret);

export const razorpay = isRazorpayConfigured
  ? new Razorpay({ key_id: keyId, key_secret: keySecret })
  : null;

export const razorpayKeyId = keyId;
export const razorpayKeySecret = keySecret;
