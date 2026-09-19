import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { formatDateTime } from "../../lib/format";
import BrandMark from "../../components/motion/BrandMark";
import Eyebrow from "../../components/motion/Eyebrow";
import RevealText from "../../components/motion/RevealText";
import PillButton from "../../components/motion/PillButton";
import Reveal from "../../components/motion/Reveal";

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
    <main className="min-h-screen w-full p-2 sm:p-3" style={{ background: "var(--surface)" }}>
      <header
        className="px-5 py-4 sm:px-6 flex items-center justify-between"
        style={{ background: "var(--role-admin)", borderRadius: "var(--radius-card)" }}
      >
        <div className="flex items-center gap-2 text-white">
          <BrandMark className="w-5 h-5" />
          <span className="text-sm font-medium uppercase" style={{ letterSpacing: "0.18em" }}>
            UniPay · Admin
          </span>
        </div>
        <button onClick={logout} className="text-xs font-medium uppercase text-white/80 hover:text-white tracking-wide">
          Logout
        </button>
      </header>

      <div className="max-w-2xl mx-auto mt-3 px-1 space-y-4">
        <p className="text-xs text-[var(--ink-soft)]">{user.name}</p>

        <Reveal as="section" className="bg-white p-6" style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--hairline)" }}>
          <Eyebrow>Vendors</Eyebrow>
          <RevealText as="h2" text="Create a vendor" className="block text-xl font-medium tracking-tight mt-1 mb-4" />
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
                Owner name
              </label>
              <input
                required
                value={form.name}
                onChange={updateField("name")}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--role-admin)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
                Shop name
              </label>
              <input
                required
                value={form.shopName}
                onChange={updateField("shopName")}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--role-admin)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={updateField("email")}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--role-admin)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={updateField("password")}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--role-admin)" }}
              />
            </div>
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            {createSuccess && <p className="text-sm text-green-600">{createSuccess}</p>}
            <PillButton
              type="submit"
              disabled={creating}
              accent="var(--role-admin)"
              accentDeep="var(--role-admin-deep)"
              className="w-full"
            >
              {creating ? "Creating..." : "Create vendor"}
            </PillButton>
          </form>
        </Reveal>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Reveal
          as="section"
          delay={80}
          className="bg-white p-6"
          style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--hairline)" }}
        >
          <Eyebrow>Directory</Eyebrow>
          <h2 className="text-lg font-medium tracking-tight mt-1 mb-3">Vendors</h2>
          {vendors === null ? (
            <p className="text-sm text-[var(--ink-soft)]">Loading...</p>
          ) : vendors.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">No vendors yet.</p>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--hairline)" }}>
              {vendors.map((v) => (
                <li key={v.id} className="flex items-center justify-between text-sm py-2.5">
                  <span className="text-[var(--ink)]">
                    {v.shopName} <span className="text-[var(--ink-soft)]">({v.user.email})</span>
                  </span>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={
                      v.isOpen
                        ? { background: "rgba(11,110,151,0.12)", color: "var(--accent-teal)" }
                        : { background: "var(--surface)", color: "var(--ink-soft)" }
                    }
                  >
                    {v.isOpen ? "Open" : "Closed"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal
          as="section"
          delay={160}
          className="bg-white p-6"
          style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--hairline)" }}
        >
          <Eyebrow>Directory</Eyebrow>
          <h2 className="text-lg font-medium tracking-tight mt-1 mb-3">Users</h2>
          {users === null ? (
            <p className="text-sm text-[var(--ink-soft)]">Loading...</p>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--hairline)" }}>
              {users.map((u) => (
                <li key={u.id} className="flex items-center justify-between text-sm py-2.5">
                  <span className="text-[var(--ink)]">
                    {u.name} <span className="text-[var(--ink-soft)]">({u.email})</span>
                  </span>
                  <span className="text-xs text-[var(--ink-soft)]">
                    {u.role} · {formatDateTime(u.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </main>
  );
}
