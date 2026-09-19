import { useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { loadRazorpayScript } from "../../lib/razorpaySdk";

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
        theme: { color: "#4f46e5" },
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4 z-10">
      <div className="w-full max-w-sm bg-white rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Up</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Pay"}
          </button>
        </form>
      </div>
    </div>
  );
}
