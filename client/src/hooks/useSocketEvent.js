import { useEffect, useRef } from "react";
import { getSocket } from "../lib/socket";

// Subscribes to a socket event for the lifetime of the calling
// component. Callers don't need to memoize `handler` - a ref always
// forwards to the latest version, so the listener is only
// attached/detached when `event` itself changes.
export function useSocketEvent(event, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();
    const listener = (...args) => handlerRef.current(...args);
    socket.on(event, listener);
    return () => socket.off(event, listener);
  }, [event]);
}
