import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { useSocketEvent } from "../../hooks/useSocketEvent";
import BrandMark from "../../components/motion/BrandMark";

const navLinkClass = ({ isActive }) =>
  `text-sm transition-colors ${isActive ? "text-white font-medium" : "text-white/70 hover:text-white"}`;

const STATUS_LABEL = {
  ACCEPTED: "accepted",
  PREPARING: "being prepared",
  READY: "ready for pickup",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const { showToast } = useToast();

  // Lives here (not on the Orders page) so a status update shows a toast
  // no matter which student page is currently open.
  useSocketEvent("order:status", (order) => {
    const label = STATUS_LABEL[order.status] || order.status;
    showToast(`${order.vendor?.shopName || "Your order"} is now ${label}`);
  });

  return (
    <main className="min-h-screen w-full p-2 sm:p-3" style={{ background: "var(--surface)" }}>
      <header
        className="px-5 py-4 sm:px-6"
        style={{ background: "var(--role-student)", borderRadius: "var(--radius-card)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <BrandMark className="w-5 h-5" />
            <span className="text-sm font-medium uppercase" style={{ letterSpacing: "0.18em" }}>
              UniPay
            </span>
          </div>
          <button onClick={logout} className="text-xs font-medium uppercase text-white/80 hover:text-white tracking-wide">
            Logout
          </button>
        </div>
        <nav className="flex gap-4 mt-3 flex-wrap">
          <NavLink to="/student" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/student/menu" className={navLinkClass}>
            Menu
          </NavLink>
          <NavLink to="/student/cart" className={navLinkClass}>
            Cart{totalCount > 0 ? ` (${totalCount})` : ""}
          </NavLink>
          <NavLink to="/student/orders" className={navLinkClass}>
            Orders
          </NavLink>
          <NavLink to="/student/transactions" className={navLinkClass}>
            Transactions
          </NavLink>
        </nav>
      </header>
      <div className="max-w-md mx-auto mt-3 px-1">
        <p className="text-xs text-[var(--ink-soft)] mb-3">
          {user.name} · {user.rollNo}
        </p>
        <Outlet />
      </div>
    </main>
  );
}
