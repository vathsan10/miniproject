import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";
import TopUp from "./TopUp";
import Eyebrow from "../../components/motion/Eyebrow";
import Reveal from "../../components/motion/Reveal";
import HoverLift from "../../components/motion/HoverLift";
import PillButton from "../../components/motion/PillButton";

const ACTIVE_STATUSES = ["PLACED", "ACCEPTED", "PREPARING", "READY"];

const cardStyle = { borderRadius: "var(--radius-card)", border: "1px solid var(--hairline)" };

export default function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");
  const [showTopUp, setShowTopUp] = useState(false);
  const [activeOrderCount, setActiveOrderCount] = useState(null);

  const refreshBalance = useCallback(() => {
    api
      .get("/wallet/balance")
      .then((data) => setBalance(data.balance))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  useEffect(() => {
    api
      .get("/orders/mine")
      .then((data) => {
        const active = data.orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
        setActiveOrderCount(active.length);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <Reveal as="div" className="bg-white p-6" style={cardStyle}>
        <Eyebrow>Wallet</Eyebrow>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {balance === null && !error ? (
          <p className="text-3xl font-medium text-[var(--ghost)] mt-2">Loading...</p>
        ) : (
          <p className="text-4xl font-medium tracking-tight text-[var(--ink)] mt-2">
            {formatCredits(balance ?? 0)}
          </p>
        )}
        <PillButton
          onClick={() => setShowTopUp(true)}
          accent="var(--role-student)"
          accentDeep="var(--role-student-deep)"
          className="mt-4 w-full"
        >
          Top Up
        </PillButton>
      </Reveal>

      {showTopUp && (
        <TopUp
          onClose={() => setShowTopUp(false)}
          onSuccess={(newBalance) => {
            setBalance(newBalance);
            setShowTopUp(false);
          }}
        />
      )}

      <Reveal delay={90}>
        <HoverLift as={Link} to="/student/orders" liftY={-4} className="block bg-white p-6" style={cardStyle}>
          <Eyebrow>Live</Eyebrow>
          <p className="text-lg font-medium tracking-tight mt-1">Active orders</p>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            {activeOrderCount === null
              ? "Loading..."
              : activeOrderCount === 0
                ? "No orders yet."
                : `${activeOrderCount} order${activeOrderCount === 1 ? "" : "s"} in progress.`}
          </p>
        </HoverLift>
      </Reveal>

      <Reveal delay={180}>
        <HoverLift as={Link} to="/student/menu" liftY={-4} className="block bg-white p-6" style={cardStyle}>
          <Eyebrow>Order</Eyebrow>
          <p className="text-lg font-medium tracking-tight mt-1">Browse menu</p>
          <p className="text-sm text-[var(--ink-soft)] mt-1">See what's available across open vendors.</p>
        </HoverLift>
      </Reveal>
    </div>
  );
}
