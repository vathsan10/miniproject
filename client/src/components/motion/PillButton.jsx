import { useState } from "react";
import { useSpring } from "../../hooks/useSpring";
import { useHoverEnabled } from "../../hooks/useHoverEnabled";

const VARIANTS = {
  light: "bg-white hover:text-white",
  solid: "text-white",
  outline: "border text-[var(--ink)] hover:text-white",
};

const SIZES = {
  md: "px-6 py-3 text-sm gap-2",
  sm: "px-4 py-1.5 text-xs gap-1.5",
};

// Pill-shaped button with a spring-driven arrow nudge on hover
// (disabled on touch/mobile). `accent` sets the role color used for
// solid/outline hover backgrounds and the light variant's text/hover.
export default function PillButton({
  children,
  variant = "solid",
  size = "md",
  accent = "var(--ink)",
  accentDeep = "var(--brand-deep)",
  showArrow = true,
  className = "",
  type = "button",
  disabled = false,
  onClick,
}) {
  const hoverEnabled = useHoverEnabled();
  const [hovered, setHovered] = useState(false);
  const arrow = useSpring(hovered && hoverEnabled ? { x: 5 } : { x: 0 }, { tension: 320, friction: 20 });

  const style =
    variant === "light"
      ? { color: accentDeep, "--hover-bg": "var(--brand-light)" }
      : variant === "outline"
        ? { borderColor: "currentColor", "--hover-bg": accent }
        : { background: accent, "--hover-bg": accentDeep };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-flex items-center justify-center rounded-full font-medium uppercase transition-colors disabled:opacity-50 disabled:pointer-events-none hover:[background:var(--hover-bg)] ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      style={{ letterSpacing: "0.06em", ...style }}
    >
      {children}
      {showArrow && (
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: `translateX(${arrow.x}px)` }}
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  );
}
