import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits, formatDateTime } from "../../lib/format";
import { useSocketEvent } from "../../hooks/useSocketEvent";
import PickupModal from "./PickupModal";

const STATUS_STYLES = {
  PLACED: "text-blue-700 bg-blue-50",
  ACCEPTED: "text-amber-700 bg-amber-50",
  PREPARING: "text-amber-700 bg-amber-50",
  READY: "text-green-700 bg-green-50",
  COLLECTED: "text-gray-700 bg-gray-100",
  REJECTED: "text-red-700 bg-red-50",
  CANCELLED: "text-gray-500 bg-gray-100",
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
  if (orders === null) return <p className="text-sm text-gray-400">Loading...</p>;
  if (orders.length === 0) return <p className="text-sm text-gray-400">No orders yet.</p>;

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <li key={order.id} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{order.vendor.shopName}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status]}`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{formatDateTime(order.createdAt)}</p>
          <ul className="mt-2 space-y-0.5">
            {order.items.map((oi) => (
              <li key={oi.id} className="text-xs text-gray-600">
                {oi.quantity}x {oi.menuItem.name}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm font-semibold text-gray-900">{formatCredits(order.total)}</p>
            {order.status === "PLACED" && (
              <button
                onClick={() => handleCancel(order.id)}
                disabled={cancellingId === order.id}
                className="text-xs text-red-600 font-medium disabled:opacity-50"
              >
                {cancellingId === order.id ? "Cancelling..." : "Cancel"}
              </button>
            )}
            {order.status === "READY" && (
              <button
                onClick={() => setPickupOrderId(order.id)}
                className="text-xs text-white font-medium px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700"
              >
                Show Pickup Code
              </button>
            )}
          </div>
        </li>
      ))}
      {pickupOrderId && (
        <PickupModal orderId={pickupOrderId} onClose={() => setPickupOrderId(null)} />
      )}
    </ul>
  );
}
