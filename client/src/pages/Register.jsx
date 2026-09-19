import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HOME_BY_ROLE } from "../lib/roles";
import Eyebrow from "../components/motion/Eyebrow";
import RevealText from "../components/motion/RevealText";
import PillButton from "../components/motion/PillButton";
import Reveal from "../components/motion/Reveal";

const initialForm = { name: "", email: "", rollNo: "", password: "" };

export default function Register() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  }

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/student", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="w-full p-2 sm:p-3">
      <section
        className="flex items-center justify-center px-4"
        style={{ background: "var(--surface)", borderRadius: "var(--radius-card-lg)", minHeight: "calc(100svh - 1rem)" }}
      >
        <Reveal
          as="div"
          className="w-full max-w-sm bg-white p-6"
          style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--hairline)" }}
        >
          <Eyebrow>New student</Eyebrow>
          <RevealText as="h1" text="Create your account" className="block text-2xl font-medium tracking-tight mt-1" />
          <p className="text-sm text-[var(--ink-soft)] mt-2 mb-6">Vendor accounts are created by an admin.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
                Name
              </label>
              <input
                required
                value={form.name}
                onChange={updateField("name")}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--role-student)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
                Roll Number
              </label>
              <input
                required
                value={form.rollNo}
                onChange={updateField("rollNo")}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--role-student)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={updateField("email")}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--role-student)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={form.password}
                onChange={updateField("password")}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--role-student)" }}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <PillButton
              type="submit"
              disabled={submitting}
              accent="var(--role-student)"
              accentDeep="var(--role-student-deep)"
              className="w-full"
            >
              {submitting ? "Creating account..." : "Create account"}
            </PillButton>
          </form>
          <p className="mt-4 text-sm text-[var(--ink-soft)] text-center">
            Already have an account?{" "}
            <Link to="/login" className="font-medium" style={{ color: "var(--brand)" }}>
              Sign in
            </Link>
          </p>
        </Reveal>
      </section>
    </main>
  );
}
