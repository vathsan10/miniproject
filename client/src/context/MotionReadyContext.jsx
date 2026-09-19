import { createContext, useContext, useState } from "react";

const MotionReadyContext = createContext(true);

// Flips true once the boot Loader finishes - content that's visible
// immediately on first paint (e.g. the Login page) reads this so its
// entrance reveal plays right as the curtain lifts, not hidden behind it.
export function MotionReadyProvider({ children }) {
  const [ready, setReady] = useState(false);
  return (
    <MotionReadyContext.Provider value={{ ready, setReady }}>{children}</MotionReadyContext.Provider>
  );
}

export function useMotionReady() {
  return useContext(MotionReadyContext);
}
