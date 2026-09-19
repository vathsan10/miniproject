import Lenis from "lenis";
import { subscribe } from "./ticker";

let lenis;

// One Lenis instance for the whole app, driven by the shared ticker.
// start()/stop() are called whenever a modal or overlay needs to lock
// native + smooth scroll (e.g. while the boot loader or a dialog is open).
export function initLenis() {
  if (lenis) return lenis;
  lenis = new Lenis({ smoothWheel: true });
  subscribe((time) => lenis.raf(time));
  return lenis;
}

export function stopLenis() {
  lenis?.stop();
}

export function startLenis() {
  lenis?.start();
}
