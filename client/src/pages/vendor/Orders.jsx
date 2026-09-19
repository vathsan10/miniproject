import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits, formatDateTime } from "../../lib/format";
import { useSocketEvent } from "../../hooks/useSocketEvent";
import { playNewOrderSound } from "../../lib/notifySound";
import Eyebrow from "../../components/motion/Eyebrow";
import Reveal from "../../components/motion/Reveal";
import PillButton from "../../components/motion/PillButton";

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
        { label: "Accept", status: "ACCEPTED", accent: "#0f8a3f", accentDeep: "#0b6b31" },
        { label: "Reject", status: "REJECTED", accent: "#dc2626", accentDeep: "#b91c1c" },
      ];
    case "ACCEPTED":
      return [{ label: "Start Preparing", status: "PREPARING", accent: "var(--role-vendor)", accentDeep: "var(--role-vendor-deep)" }];
    case "PREPARING":
      return [{ label: "Mark Ready", status: "READY", accent: "var(--role-vendor)", accentDeep: "var(--role-vendor-deep)" }];
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
  if (orders === null) return <p className="text-sm text-[var(--ink-soft)]">Loading...</p>;

  return (
    <div className="space-y-6">
      {COLUMNS.map((col) => {
        const columnOrders = orders.filter((o) => o.status === col.status);
        return (
          <div key={col.status}>
            <Eyebrow>
              {col.label} ({columnOrders.length})
            </Eyebrow>
            {columnOrders.length === 0 ? (
              <p className="text-sm text-[var(--ink-soft)] mt-2">No orders here.</p>
            ) : (
              <ul className="space-y-2 mt-3">
                {columnOrders.map((order) => (
                  <Reveal
                    key={order.id}
                    as="li"
                    y={16}
                    className="bg-white p-4 transition-shadow"
                    style={{
                      borderRadius: "var(--radius-card)",
                      border: justArrivedId === order.id ? "1px solid var(--role-vendor)" : "1px solid var(--hairline)",
                      boxShadow: justArrivedId === order.id ? "0 0 0 3px rgba(11,110,151,0.2)" : "none",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[var(--ink)]">
                        {order.student?.name || "Student"}
                      </p>
                      <p className="text-xs text-[var(--ink-soft)]">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {order.items.map((oi) => (
                        <li key={oi.id} className="text-xs text-[var(--ink-soft)]">
                          {oi.quantity}x {oi.menuItem.name}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-sm font-semibold text-[var(--ink)]">{formatCredits(order.total)}</p>
                      <div className="flex gap-2">
                        {actionsFor(order).map((action) => (
                          <PillButton
                            key={action.status}
                            size="sm"
                            showArrow={false}
                            accent={action.accent}
                            accentDeep={action.accentDeep}
                            disabled={actingId === order.id}
                            onClick={() => act(order, action.status)}
                          >
                            {action.label}
                          </PillButton>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
