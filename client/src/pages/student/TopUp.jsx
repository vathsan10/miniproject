import { useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { loadRazorpayScript } from "../../lib/razorpaySdk";
import Modal from "../../components/motion/Modal";
import Eyebrow from "../../components/motion/Eyebrow";
import RevealText from "../../components/motion/RevealText";
import PillButton from "../../components/motion/PillButton";

export default function TopUp({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function finishTopup(paymentIntentId, extra = {}) {
    const result = await api.post("/wallet/topup/verify", { paymentIntentId, ...extra });
    onSuccess(result.balance);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const amt = Number(amount);
    if (!Number.isInteger(amt) || amt < 10 || amt > 5000) {
      setError("Enter a whole number between ₹10 and ₹5000");
      return;
    }

    setSubmitting(true);
    try {
      const init = await api.post("/wallet/topup/init", { amount: amt });

      if (init.mode === "mock") {
        await finishTopup(init.paymentIntentId);
        return;
      }

      // Real Razorpay mode: open checkout, then verify the signature
      // server-side once the user completes payment.
      await loadRazorpayScript();
      const checkout = new window.Razorpay({
        key: init.keyId,
        amount: init.amount * 100,
        currency: "INR",
        name: "UniPay",
        description: "Wallet top-up",
        order_id: init.orderId,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#2563c9" },
        handler: async (response) => {
          try {
            await finishTopup(init.paymentIntentId, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch (err) {
            setError(err.message);
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });
      checkout.open();
      return; // submitting stays true until the handler/dismiss above fires
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  }

  return (
    <Modal onClose={onClose} maxWidth="24rem">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Eyebrow>Wallet</Eyebrow>
          <RevealText as="h2" text="Top Up" className="block text-3xl font-medium tracking-tight mt-1" />
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:bg-[var(--surface)]"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
            Amount (₹10 - ₹5000)
          </label>
          <input
            type="number"
            min={10}
            max={5000}
            step={1}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--role-student)" }}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <PillButton
          type="submit"
          disabled={submitting}
          accent="var(--role-student)"
          accentDeep="var(--role-student-deep)"
          className="w-full"
        >
          {submitting ? "Processing..." : "Pay"}
        </PillButton>
      </form>
    </Modal>
  );
}
