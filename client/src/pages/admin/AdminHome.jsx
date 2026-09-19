import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { formatDateTime } from "../../lib/format";

const emptyForm = { name: "", email: "", password: "", shopName: "" };

export default function AdminHome() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [users, setUsers] = useState(null);
  const [vendors, setVendors] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    Promise.all([api.get("/admin/users"), api.get("/admin/vendors")])
      .then(([u, v]) => {
        setUsers(u.users);
        setVendors(v.vendors);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setCreating(true);
    try {
      await api.post("/admin/vendors", form);
      setCreateSuccess(`Vendor "${form.shopName}" created.`);
      setForm(emptyForm);
      refresh();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
        <span className="font-semibold">UniPay · Admin</span>
        <button onClick={logout} className="text-sm underline">
          Logout
        </button>
      </header>
      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <p className="text-xs text-gray-400">{user.name}</p>

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Create Vendor</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner name</label>
              <input
                required
                value={form.name}
                onChange={updateField("name")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop name</label>
              <input
                required
                value={form.shopName}
                onChange={updateField("shopName")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={updateField("email")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={updateField("password")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            {createSuccess && <p className="text-sm text-green-600">{createSuccess}</p>}
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-slate-800 text-white py-2 text-sm font-medium hover:bg-slate-900 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create vendor"}
            </button>
          </form>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Vendors</h2>
          {vendors === null ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : vendors.length === 0 ? (
            <p className="text-sm text-gray-400">No vendors yet.</p>
          ) : (
            <ul className="space-y-2">
              {vendors.map((v) => (
                <li key={v.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {v.shopName} <span className="text-gray-400">({v.user.email})</span>
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      v.isOpen ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {v.isOpen ? "Open" : "Closed"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Users</h2>
          {users === null ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <ul className="space-y-2">
              {users.map((u) => (
                <li key={u.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {u.name} <span className="text-gray-400">({u.email})</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {u.role} · {formatDateTime(u.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
