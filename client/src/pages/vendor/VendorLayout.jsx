import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BrandMark from "../../components/motion/BrandMark";

const navLinkClass = ({ isActive }) =>
  `text-sm transition-colors ${isActive ? "text-white font-medium" : "text-white/70 hover:text-white"}`;

export default function VendorLayout() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen w-full p-2 sm:p-3" style={{ background: "var(--surface)" }}>
      <header
        className="px-5 py-4 sm:px-6"
        style={{ background: "var(--role-vendor)", borderRadius: "var(--radius-card)" }}
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
          <NavLink to="/vendor" end className={navLinkClass}>
            Orders
          </NavLink>
          <NavLink to="/vendor/menu" className={navLinkClass}>
            Menu
          </NavLink>
          <NavLink to="/vendor/scan" className={navLinkClass}>
            Scan
          </NavLink>
          <NavLink to="/vendor/sales" className={navLinkClass}>
            Sales
          </NavLink>
        </nav>
      </header>
      <div className="max-w-md mx-auto mt-3 px-1">
        <p className="text-xs text-[var(--ink-soft)] mb-3">{user.name}</p>
        <Outlet />
      </div>
    </main>
  );
}
