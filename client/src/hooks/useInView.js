import { useEffect, useRef, useState } from "react";

// Fires once when the element first enters the viewport (optionally
// after `delay` ms), then disconnects - matching the spec's "play once"
// entrance-reveal behavior.
export function useInView({ threshold = 0.2, delay = 0 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setInView(true), delay);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, threshold]);

  return [ref, inView];
}
