import { useEffect, useState } from "react";

const QUERY = "(min-width: 769px)";

// Hover micro-interactions are disabled at/below 768px (touch devices
// don't have a meaningful hover state, and a "stuck" hover animation
// after a tap looks broken).
export function useHoverEnabled() {
  const [enabled, setEnabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handler = (e) => setEnabled(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return enabled;
}
