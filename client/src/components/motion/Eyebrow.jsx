// Small uppercase label with a leading dot, used above section
// headings - "dark" tone for light backgrounds, "light" tone for navy
// sections.
export default function Eyebrow({ children, tone = "dark", className = "" }) {
  const isDark = tone === "dark";
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-medium uppercase ${className}`}
      style={{ letterSpacing: "0.22em", color: isDark ? "var(--ink-soft)" : "rgba(255,255,255,0.7)" }}
    >
      <span
        className="rounded-full"
        style={{
          width: "0.375rem",
          height: "0.375rem",
          flexShrink: 0,
          background: isDark ? "var(--brand)" : "var(--brand-light)",
        }}
      />
      {children}
    </span>
  );
}
