// A single shared requestAnimationFrame loop that Lenis and every
// spring-driven component subscribe to, instead of each starting its
// own rAF loop.
const listeners = new Set();
let rafId = null;

function tick(time) {
  for (const fn of listeners) fn(time);
  rafId = requestAnimationFrame(tick);
}

export function subscribe(fn) {
  listeners.add(fn);
  if (rafId === null) {
    rafId = requestAnimationFrame(tick);
  }
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}
