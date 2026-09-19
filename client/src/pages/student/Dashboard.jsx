import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";
import TopUp from "./TopUp";

export default function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");
  const [showTopUp, setShowTopUp] = useState(false);

  const refreshBalance = useCallback(() => {
    api
      .get("/wallet/balance")
      .then((data) => setBalance(data.balance))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-500">Wallet balance</p>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {balance === null && !error ? (
          <p className="text-2xl font-semibold text-gray-400 mt-1">Loading...</p>
        ) : (
          <p className="text-3xl font-semibold text-gray-900 mt-1">
            {formatCredits(balance ?? 0)}
          </p>
        )}
        <button
          onClick={() => setShowTopUp(true)}
          className="mt-4 w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700"
        >
          Top Up
        </button>
      </div>

      {showTopUp && (
        <TopUp
          onClose={() => setShowTopUp(false)}
          onSuccess={(newBalance) => {
            setBalance(newBalance);
            setShowTopUp(false);
          }}
        />
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-medium text-gray-700">Active orders</p>
        <p className="text-sm text-gray-400 mt-1">No orders yet - ordering arrives in Phase 5.</p>
      </div>

      <Link
        to="/student/menu"
        className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300"
      >
        <p className="text-sm font-medium text-gray-700">Browse Menu</p>
        <p className="text-sm text-gray-400 mt-1">See what's available across open vendors.</p>
      </Link>
    </div>
  );
}
