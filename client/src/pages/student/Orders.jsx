import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits, formatDateTime } from "../../lib/format";
import { useSocketEvent } from "../../hooks/useSocketEvent";
import PickupModal from "./PickupModal";
import Reveal from "../../components/motion/Reveal";
import PillButton from "../../components/motion/PillButton";

const STATUS_STYLES = {
  PLACED: { background: "rgba(37,99,201,0.1)", color: "var(--brand)" },
  ACCEPTED: { background: "rgba(11,110,151,0.1)", color: "var(--accent-teal)" },
  PREPARING: { background: "rgba(11,110,151,0.1)", color: "var(--accent-teal)" },
  READY: { background: "rgba(16,163,74,0.12)", color: "#0f8a3f" },
  COLLECTED: { background: "var(--surface)", color: "var(--ink-soft)" },
  REJECTED: { background: "rgba(220,38,38,0.1)", color: "#b91c1c" },
  CANCELLED: { background: "var(--surface)", color: "var(--ink-soft)" },
};

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [pickupOrderId, setPickupOrderId] = useState(null);

  const refresh = useCallback(() => {
    api
      .get("/orders/mine")
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useSocketEvent("order:status", (updated) => {
    setOrders((current) =>
      current ? current.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o)) : current
    );
  });

  async function handleCancel(orderId) {
    setCancellingId(orderId);
    setError("");
    try {
      await api.post(`/orders/${orderId}/cancel`, {});
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (orders === null) return <p className="text-sm text-[var(--ink-soft)]">Loading...</p>;
  if (orders.length === 0) return <p className="text-sm text-[var(--ink-soft)]">No orders yet.</p>;

  return (
    <ul className="space-y-3">
      {orders.map((order, i) => (
        <Reveal
          key={order.id}
          as="li"
          delay={i * 60}
          className="bg-white p-5"
          style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--hairline)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--ink)]">{order.vendor.shopName}</p>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={STATUS_STYLES[order.status]}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-[var(--ink-soft)] mt-1">{formatDateTime(order.createdAt)}</p>
          <ul className="mt-2 space-y-0.5">
            {order.items.map((oi) => (
              <li key={oi.id} className="text-xs text-[var(--ink-soft)]">
                {oi.quantity}x {oi.menuItem.name}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm font-semibold text-[var(--ink)]">{formatCredits(order.total)}</p>
            {order.status === "PLACED" && (
              <button
                onClick={() => handleCancel(order.id)}
                disabled={cancellingId === order.id}
                className="text-xs text-red-600 font-medium uppercase tracking-wide disabled:opacity-50"
              >
                {cancellingId === order.id ? "Cancelling..." : "Cancel"}
              </button>
            )}
            {order.status === "READY" && (
              <PillButton
                onClick={() => setPickupOrderId(order.id)}
                accent="#0f8a3f"
                accentDeep="#0b6b31"
                showArrow={false}
                size="sm"
              >
                Show Pickup Code
              </PillButton>
            )}
          </div>
        </Reveal>
      ))}
      {pickupOrderId && (
        <PickupModal orderId={pickupOrderId} onClose={() => setPickupOrderId(null)} />
      )}
    </ul>
  );
}
