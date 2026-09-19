import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `text-sm ${isActive ? "font-semibold underline" : "opacity-90 hover:opacity-100"}`;

export default function VendorLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-amber-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold">UniPay · Vendor</span>
          <button onClick={logout} className="text-sm underline">
            Logout
          </button>
        </div>
        <nav className="flex gap-4 mt-2">
          <NavLink to="/vendor" end className={navLinkClass}>
            Orders
          </NavLink>
          <NavLink to="/vendor/menu" className={navLinkClass}>
            Menu
          </NavLink>
          <NavLink to="/vendor/scan" className={navLinkClass}>
            Scan
          </NavLink>
        </nav>
      </header>
      <main className="p-4 max-w-md mx-auto">
        <p className="text-xs text-gray-400 mb-2">{user.name}</p>
        <Outlet />
      </main>
    </div>
  );
}
