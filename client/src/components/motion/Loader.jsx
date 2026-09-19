import { useEffect, useState } from "react";
import BrandMark from "./BrandMark";
import { stopLenis, startLenis } from "../../lib/lenisSetup";

const MIN_VISIBLE_MS = 1400;
const MAX_VISIBLE_MS = 2600;
const EXIT_MS = 850;

// Navy boot curtain: wordmark + a filling progress bar, visible for at
// least MIN_VISIBLE_MS (capped at MAX_VISIBLE_MS if `load` never fires),
// then slides up and calls onReady() so gated hero content can play in.
export default function Loader({ onReady }) {
  const [exiting, setExiting] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minVisible = reduced ? 200 : MIN_VISIBLE_MS;
    const exitMs = reduced ? 0 : EXIT_MS;

    stopLenis();
    let finished = false;
    const start = performance.now();

    function finish() {
      if (finished) return;
      finished = true;
      onReady?.();
      startLenis();
      setExiting(true);
      setTimeout(() => setRemoved(true), exitMs);
    }

    function afterLoad() {
      const elapsed = performance.now() - start;
      setTimeout(finish, Math.max(0, minVisible - elapsed));
    }

    if (document.readyState === "complete") {
      afterLoad();
    } else {
      window.addEventListener("load", afterLoad, { once: true });
    }
    const maxTimer = setTimeout(finish, MAX_VISIBLE_MS);

    return () => {
      window.removeEventListener("load", afterLoad);
      clearTimeout(maxTimer);
    };
  }, [onReady]);

  if (removed) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 text-white"
      style={{
        background: "var(--brand-deep)",
        transform: exiting ? "translateY(-105%)" : "translateY(0%)",
        transition: `transform ${EXIT_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
      }}
    >
      <div className="flex items-center gap-2 text-2xl font-medium uppercase" style={{ letterSpacing: "0.2em" }}>
        <BrandMark className="w-7 h-7" />
        UniPay
      </div>
      <div
        className="overflow-hidden rounded-full"
        style={{ width: "10rem", height: "1px", background: "rgba(255,255,255,0.2)" }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            background: "white",
            transformOrigin: "left",
            transform: "scaleX(0)",
            animation: "loader-fill 1280ms cubic-bezier(0.65,0,0.35,1) 120ms forwards",
          }}
        />
      </div>
    </div>
  );
}
