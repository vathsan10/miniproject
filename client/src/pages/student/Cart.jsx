import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";
import { useCart } from "../../context/CartContext";
import Eyebrow from "../../components/motion/Eyebrow";
import RevealText from "../../components/motion/RevealText";
import PillButton from "../../components/motion/PillButton";
import Reveal from "../../components/motion/Reveal";

const cardStyle = { borderRadius: "var(--radius-card)", border: "1px solid var(--hairline)" };

export default function Cart() {
  const { vendorId, vendorName, items, updateQuantity, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  // Uncontrolled on purpose: Safari's native time-picker widget fights
  // with React re-applying `value` on every keystroke and spuriously
  // shows "Invalid value", so we read the value directly at submit time
  // instead of mirroring it into state on every change.
  const pickupTimeRef = useRef(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill with a valid default (now + 15 min) so Safari never sees a
  // partially-filled hour/minute/AM-PM segment as an "invalid value" for
  // anyone who submits without touching the field.
  const defaultPickupTime = (() => {
    const d = new Date(Date.now() + 15 * 60 * 1000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  })();

  useEffect(() => {
    api
      .get("/wallet/balance")
      .then((data) => setBalance(data.balance))
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-soft)]">
        Your cart is empty.{" "}
        <Link to="/student/menu" className="font-medium" style={{ color: "var(--role-student)" }}>
          Browse the menu
        </Link>{" "}
        to add items.
      </p>
    );
  }

  const insufficientBalance = balance !== null && totalPrice > balance;

  async function handleCheckout(e) {
    e.preventDefault();
    setError("");
    const pickupTime = pickupTimeRef.current?.value;
    if (!pickupTime) {
      setError("Choose a pickup time");
      return;
    }

    // Same-day pickup app: combine the chosen time with today's date.
    const [hours, minutes] = pickupTime.split(":").map(Number);
    const pickup = new Date();
    pickup.setHours(hours, minutes, 0, 0);

    setSubmitting(true);
    try {
      await api.post("/orders", {
        vendorId,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        pickupTime: pickup.toISOString(),
      });
      clearCart();
      navigate("/student/orders", { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Eyebrow>{vendorName}</Eyebrow>
      <RevealText as="h1" text="Your order" className="block text-2xl font-medium tracking-tight -mt-1" />
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.menuItemId} className="bg-white p-4 flex items-center justify-between" style={cardStyle}>
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">{item.name}</p>
              <p className="text-xs text-[var(--ink-soft)]">{formatCredits(item.price)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "var(--surface)", color: "var(--ink)" }}
              >
                -
              </button>
              <span className="text-sm w-4 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-40"
                style={{ background: "var(--surface)", color: "var(--ink)" }}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Reveal as="form" onSubmit={handleCheckout} className="bg-white p-5 space-y-3" style={cardStyle}>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
            Pickup time
          </label>
          <input
            type="time"
            defaultValue={defaultPickupTime}
            ref={pickupTimeRef}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--role-student)" }}
          />
        </div>
        <div className="flex items-center justify-between text-sm font-semibold text-[var(--ink)]">
          <span>Total</span>
          <span>{formatCredits(totalPrice)}</span>
        </div>
        {insufficientBalance && (
          <p className="text-sm text-red-600">
            Insufficient balance ({formatCredits(balance)} available).{" "}
            <Link to="/student" className="underline">
              Top up
            </Link>
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <PillButton
          type="submit"
          disabled={submitting || insufficientBalance}
          accent="var(--role-student)"
          accentDeep="var(--role-student-deep)"
          className="w-full"
        >
          {submitting ? "Placing order..." : "Place Order"}
        </PillButton>
      </Reveal>
    </div>
  );
}
