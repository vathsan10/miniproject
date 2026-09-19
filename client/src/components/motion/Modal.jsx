import { useEffect, useState } from "react";
import { useSpring } from "../../hooks/useSpring";
import { useScrollLock } from "../../hooks/useScrollLock";

// Shared modal chrome: backdrop fade + panel spring-in
// ({opacity:0,y:28,scale:0.96} -> settled), scroll-locked while open,
// closes on Escape or backdrop click.
export default function Modal({ onClose, children, maxWidth = "24rem" }) {
  useScrollLock();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const backdrop = useSpring(mounted ? { opacity: 1 } : { opacity: 0 }, { tension: 240, friction: 30 });
  const panel = useSpring(
    mounted ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 28, scale: 0.96 },
    { tension: 240, friction: 26 }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(15,47,99,0.4)", backdropFilter: "blur(6px)", opacity: backdrop.opacity }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full bg-white overflow-y-auto"
        style={{
          maxWidth,
          maxHeight: "92svh",
          borderRadius: "var(--radius-card)",
          padding: "1.5rem",
          boxShadow: "0 2.5rem 5rem -1.25rem rgba(15,47,99,0.35)",
          opacity: panel.opacity,
          transform: `translateY(${panel.y}px) scale(${panel.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
