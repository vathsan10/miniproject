import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HOME_BY_ROLE } from "../lib/roles";
import { useMotionReady } from "../context/MotionReadyContext";
import BrandMark from "../components/motion/BrandMark";
import Eyebrow from "../components/motion/Eyebrow";
import RevealText from "../components/motion/RevealText";
import PillButton from "../components/motion/PillButton";

export default function Login() {
  const { user, loading, login } = useAuth();
  const { ready } = useMotionReady();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(HOME_BY_ROLE[loggedInUser.role], { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="w-full p-2 sm:p-3">
      <section
        className="relative isolate overflow-hidden flex flex-col"
        style={{
          background: "var(--brand-deep)",
          borderRadius: "var(--radius-card-lg)",
          minHeight: "calc(100svh - 1rem)",
          color: "white",
        }}
      >
        <header className="flex items-center gap-2 p-6 sm:p-10">
          <BrandMark className="w-5 h-5" />
          <span className="text-sm font-medium uppercase" style={{ letterSpacing: "0.2em" }}>
            UniPay
          </span>
        </header>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 pb-10">
          <Eyebrow tone="light" className="mb-4">
            Campus wallet &amp; canteen
          </Eyebrow>
          <RevealText
            as="h1"
            text="Top Up. Order. Skip The Line."
            play={ready}
            wordStagger={110}
            duration={900}
            className="block font-medium uppercase leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}
          />
          <p className="mt-4 max-w-md text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            One account, three ways in — pre-order food as a student, run the
            counter as a vendor, or manage the club as an admin.
          </p>

          <div
            className="mt-10 w-full max-w-sm bg-white text-[var(--ink)] p-6"
            style={{ borderRadius: "var(--radius-card)", boxShadow: "0 2.5rem 5rem -1.5rem rgba(0,0,0,0.45)" }}
          >
            <Eyebrow>Sign in</Eyebrow>
            <h2 className="text-2xl font-medium tracking-tight mt-1">Welcome back</h2>
            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--brand-light)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--brand-light)" }}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <PillButton type="submit" disabled={submitting} accent="var(--ink)" accentDeep="var(--brand-deep)" className="w-full">
                {submitting ? "Signing in..." : "Sign in"}
              </PillButton>
            </form>
            <p className="mt-4 text-sm text-[var(--ink-soft)] text-center">
              New student?{" "}
              <Link to="/register" className="font-medium" style={{ color: "var(--brand)" }}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
