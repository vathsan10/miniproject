import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `text-sm ${isActive ? "font-semibold underline" : "opacity-90 hover:opacity-100"}`;

export default function StudentLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold">UniPay · Student</span>
          <button onClick={logout} className="text-sm underline">
            Logout
          </button>
        </div>
        <nav className="flex gap-4 mt-2">
          <NavLink to="/student" end className={navLinkClass}>
            Dashboard
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
