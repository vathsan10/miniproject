import { useEffect } from "react";
import { stopLenis, startLenis } from "../lib/lenisSetup";

// Locks smooth + native scroll for as long as the calling component is
// mounted (a modal, an overlay) and restores it on unmount.
export function useScrollLock() {
  useEffect(() => {
    stopLenis();
    const html = document.documentElement;
    html.style.position = "relative";
    html.style.overflow = "hidden";
    html.style.height = "100%";
    return () => {
      startLenis();
      html.style.removeProperty("position");
      html.style.removeProperty("overflow");
      html.style.removeProperty("height");
    };
  }, []);
}
