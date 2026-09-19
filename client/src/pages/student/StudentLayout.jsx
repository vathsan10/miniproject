import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { useSocketEvent } from "../../hooks/useSocketEvent";

const navLinkClass = ({ isActive }) =>
  `text-sm ${isActive ? "font-semibold underline" : "opacity-90 hover:opacity-100"}`;

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold">UniPay · Student</span>
          <button onClick={logout} className="text-sm underline">
            Logout
          </button>
        </div>
        <nav className="flex gap-4 mt-2 flex-wrap">
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
      <main className="p-4 max-w-md mx-auto">
        <p className="text-xs text-gray-400 mb-2">
          {user.name} · {user.rollNo}
        </p>
        <Outlet />
      </main>
    </div>
  );
}
