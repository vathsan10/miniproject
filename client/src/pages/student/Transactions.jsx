import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits, formatDateTime } from "../../lib/format";

const TYPE_STYLES = {
  TOPUP: "text-green-700 bg-green-50",
  PURCHASE: "text-red-700 bg-red-50",
  REFUND: "text-blue-700 bg-blue-50",
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
  if (transactions === null) return <p className="text-sm text-gray-400">Loading...</p>;
  if (transactions.length === 0) {
    return <p className="text-sm text-gray-400">No transactions yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {transactions.map((t) => (
        <li
          key={t.id}
          className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
        >
          <div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_STYLES[t.type]}`}>
              {t.type}
            </span>
            <p className="text-xs text-gray-400 mt-1">{formatDateTime(t.createdAt)}</p>
            {t.reference && <p className="text-xs text-gray-300 mt-0.5">{t.reference}</p>}
          </div>
          <p className="font-semibold text-gray-900">
            {SIGN[t.type]}
            {formatCredits(t.amount)}
          </p>
        </li>
      ))}
    </ul>
  );
}
