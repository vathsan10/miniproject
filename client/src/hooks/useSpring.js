import { useEffect, useRef, useState } from "react";
import { subscribe } from "../lib/ticker";

const REST_EPSILON = 0.001;

// A physically-modeled spring per numeric key in `target`, matching
// react-spring's {tension, friction} model:
//   v += (-tension*(x-target) - friction*v) * dt
//   x += v*dt
// Returns a plain object of live values that settle toward `target`
// every frame via the shared ticker, so callers can drive inline
// styles (transform/opacity) directly from real spring physics rather
// than a canned CSS transition curve.
export function useSpring(target, { tension = 200, friction = 26 } = {}) {
  const keys = Object.keys(target);
  const valuesRef = useRef({ ...target });
  const velocityRef = useRef(Object.fromEntries(keys.map((k) => [k, 0])));
  const targetRef = useRef(target);
  const [, forceRender] = useState(0);

  targetRef.current = target;

  useEffect(() => {
    let lastTime = null;
    return subscribe((time) => {
      if (lastTime === null) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.064);
      lastTime = time;

      let moving = false;
      for (const key of Object.keys(targetRef.current)) {
        const t = targetRef.current[key];
        const x = valuesRef.current[key] ?? t;
        const v = velocityRef.current[key] ?? 0;
        const force = -tension * (x - t) - friction * v;
        const nextV = v + force * dt;
        const nextX = x + nextV * dt;
        velocityRef.current[key] = nextV;
        valuesRef.current[key] = nextX;
        if (Math.abs(t - nextX) > REST_EPSILON || Math.abs(nextV) > REST_EPSILON) {
          moving = true;
        }
      }
      if (moving) forceRender((n) => n + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tension, friction]);

  return valuesRef.current;
}
