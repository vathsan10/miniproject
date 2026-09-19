import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits, formatDateTime } from "../../lib/format";
import { useSocketEvent } from "../../hooks/useSocketEvent";
import { playNewOrderSound } from "../../lib/notifySound";

const COLUMNS = [
  { status: "PLACED", label: "Placed" },
  { status: "ACCEPTED", label: "Accepted" },
  { status: "PREPARING", label: "Preparing" },
  { status: "READY", label: "Ready" },
];

const ACTIVE_STATUSES = COLUMNS.map((c) => c.status);

function actionsFor(order) {
  switch (order.status) {
    case "PLACED":
      return [
        { label: "Accept", status: "ACCEPTED", style: "bg-green-600 hover:bg-green-700" },
        { label: "Reject", status: "REJECTED", style: "bg-red-600 hover:bg-red-700" },
      ];
    case "ACCEPTED":
      return [{ label: "Start Preparing", status: "PREPARING", style: "bg-amber-600 hover:bg-amber-700" }];
    case "PREPARING":
      return [{ label: "Mark Ready", status: "READY", style: "bg-amber-600 hover:bg-amber-700" }];
    default:
      return [];
  }
}

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);
  const [justArrivedId, setJustArrivedId] = useState(null);

  const refresh = useCallback(() => {
    api
      .get("/vendor/orders")
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useSocketEvent("order:new", (order) => {
    setOrders((current) => (current ? [...current, order] : [order]));
    playNewOrderSound();
    setJustArrivedId(order.id);
    setTimeout(() => setJustArrivedId((id) => (id === order.id ? null : id)), 2000);
  });

  useSocketEvent("order:status", (updated) => {
    setOrders((current) => {
      if (!current) return current;
      if (!ACTIVE_STATUSES.includes(updated.status)) {
        return current.filter((o) => o.id !== updated.id);
      }
      return current.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o));
    });
  });

  async function act(order, status) {
    setActingId(order.id);
    setError("");
    try {
      await api.patch(`/vendor/orders/${order.id}/status`, { status });
      setOrders((current) =>
        status === "REJECTED"
          ? current.filter((o) => o.id !== order.id)
          : current.map((o) => (o.id === order.id ? { ...o, status } : o))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (orders === null) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-6">
      {COLUMNS.map((col) => {
        const columnOrders = orders.filter((o) => o.status === col.status);
        return (
          <div key={col.status}>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              {col.label} ({columnOrders.length})
            </h2>
            {columnOrders.length === 0 ? (
              <p className="text-sm text-gray-400">No orders here.</p>
            ) : (
              <ul className="space-y-2">
                {columnOrders.map((order) => (
                  <li
                    key={order.id}
                    className={`bg-white rounded-xl border p-3 transition-shadow ${
                      justArrivedId === order.id
                        ? "border-amber-400 ring-2 ring-amber-300"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {order.student?.name || "Student"}
                      </p>
                      <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {order.items.map((oi) => (
                        <li key={oi.id} className="text-xs text-gray-600">
                          {oi.quantity}x {oi.menuItem.name}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCredits(order.total)}
                      </p>
                      <div className="flex gap-2">
                        {actionsFor(order).map((action) => (
                          <button
                            key={action.status}
                            onClick={() => act(order, action.status)}
                            disabled={actingId === order.id}
                            className={`text-xs text-white font-medium px-2 py-1 rounded-lg disabled:opacity-50 ${action.style}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
