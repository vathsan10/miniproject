import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits, formatDateTime } from "../../lib/format";
import Reveal from "../../components/motion/Reveal";

const TYPE_STYLES = {
  TOPUP: { background: "rgba(16,163,74,0.12)", color: "#0f8a3f" },
  PURCHASE: { background: "rgba(220,38,38,0.1)", color: "#b91c1c" },
  REFUND: { background: "rgba(37,99,201,0.1)", color: "var(--brand)" },
};

const SIGN = { TOPUP: "+", PURCHASE: "-", REFUND: "+" };

export default function Transactions() {
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/wallet/transactions")
      .then((data) => setTransactions(data.transactions))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (transactions === null) return <p className="text-sm text-[var(--ink-soft)]">Loading...</p>;
  if (transactions.length === 0) {
    return <p className="text-sm text-[var(--ink-soft)]">No transactions yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {transactions.map((t, i) => (
        <Reveal
          key={t.id}
          as="li"
          delay={i * 40}
          y={16}
          className="bg-white p-4 flex items-center justify-between"
          style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--hairline)" }}
        >
          <div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={TYPE_STYLES[t.type]}>
              {t.type}
            </span>
            <p className="text-xs text-[var(--ink-soft)] mt-1">{formatDateTime(t.createdAt)}</p>
            {t.reference && <p className="text-xs text-[var(--ghost)] mt-0.5">{t.reference}</p>}
          </div>
          <p className="font-semibold text-[var(--ink)]">
            {SIGN[t.type]}
            {formatCredits(t.amount)}
          </p>
        </Reveal>
      ))}
    </ul>
  );
}
