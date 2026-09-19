import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";
import Eyebrow from "../../components/motion/Eyebrow";
import Reveal from "../../components/motion/Reveal";

const cardStyle = { borderRadius: "var(--radius-card)", border: "1px solid var(--hairline)" };

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
  if (summary === null) return <p className="text-sm text-[var(--ink-soft)]">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Reveal as="div" className="bg-white p-5" style={cardStyle}>
          <Eyebrow>Today's orders</Eyebrow>
          <p className="text-3xl font-medium tracking-tight text-[var(--ink)] mt-2">{summary.ordersCount}</p>
        </Reveal>
        <Reveal as="div" delay={70} className="bg-white p-5" style={cardStyle}>
          <Eyebrow>Credits earned</Eyebrow>
          <p className="text-3xl font-medium tracking-tight text-[var(--ink)] mt-2">
            {formatCredits(summary.creditsEarned)}
          </p>
        </Reveal>
      </div>

      <Reveal as="div" delay={140} className="bg-white p-5" style={cardStyle}>
        <Eyebrow>Top sellers</Eyebrow>
        <p className="text-lg font-medium tracking-tight mt-1 mb-3">Top-selling items today</p>
        {summary.topItems.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">No sales yet today.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--hairline)" }}>
            {summary.topItems.map((item) => (
              <li key={item.name} className="flex items-center justify-between text-sm py-2">
                <span className="text-[var(--ink)]">{item.name}</span>
                <span className="text-[var(--ink-soft)]">{item.quantity} sold</span>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </div>
  );
}
