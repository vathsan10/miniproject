import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";

export default function Sales() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/vendor/sales/summary")
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (summary === null) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Today's orders</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{summary.ordersCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Credits earned</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {formatCredits(summary.creditsEarned)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Top-selling items today</p>
        {summary.topItems.length === 0 ? (
          <p className="text-sm text-gray-400">No sales yet today.</p>
        ) : (
          <ul className="space-y-1">
            {summary.topItems.map((item) => (
              <li key={item.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-800">{item.name}</span>
                <span className="text-gray-500">{item.quantity} sold</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
