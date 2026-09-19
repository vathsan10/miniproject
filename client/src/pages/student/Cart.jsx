import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";
import { useCart } from "../../context/CartContext";

export default function Cart() {
  const { vendorId, vendorName, items, updateQuantity, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [pickupTime, setPickupTime] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get("/wallet/balance")
      .then((data) => setBalance(data.balance))
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Your cart is empty.{" "}
        <Link to="/student/menu" className="text-indigo-600 underline">
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
      <p className="text-sm font-medium text-gray-700">{vendorName}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.menuItemId}
            className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-400">{formatCredits(item.price)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                className="w-6 h-6 rounded-full bg-gray-100 text-gray-700"
              >
                -
              </button>
              <span className="text-sm w-4 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleCheckout} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pickup time</label>
          <input
            type="time"
            required
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
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
        <button
          type="submit"
          disabled={submitting || insufficientBalance}
          className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}
