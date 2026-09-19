import { useAuth } from "../../context/AuthContext";

export default function VendorHome() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-amber-600 text-white px-4 py-3 flex items-center justify-between">
        <span className="font-semibold">UniPay · Vendor</span>
        <button onClick={logout} className="text-sm underline">
          Logout
        </button>
      </header>
      <main className="p-4">
        <h1 className="text-lg font-semibold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-gray-400 mt-6 text-sm">
          Menu management and the live order dashboard are coming in the next phases.
        </p>
      </main>
    </div>
  );
}
