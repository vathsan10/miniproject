import { useAuth } from "../../context/AuthContext";

export default function AdminHome() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
        <span className="font-semibold">UniPay · Admin</span>
        <button onClick={logout} className="text-sm underline">
          Logout
        </button>
      </header>
      <main className="p-4">
        <h1 className="text-lg font-semibold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-gray-400 mt-6 text-sm">
          Vendor creation and user listing are coming in Phase 8.
        </p>
      </main>
    </div>
  );
}
