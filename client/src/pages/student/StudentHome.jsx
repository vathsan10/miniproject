import { useAuth } from "../../context/AuthContext";

export default function StudentHome() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
        <span className="font-semibold">UniPay · Student</span>
        <button onClick={logout} className="text-sm underline">
          Logout
        </button>
      </header>
      <main className="p-4">
        <h1 className="text-lg font-semibold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-gray-500 mt-1">Roll No: {user.rollNo}</p>
        <p className="text-gray-400 mt-6 text-sm">
          Wallet, menu, and ordering are coming in the next phases.
        </p>
      </main>
    </div>
  );
}
