import { io } from "socket.io-client";

let socket;

// A single shared, lazily-created connection. The server authenticates
// it via the same httpOnly cookie the REST API uses and auto-joins the
// right room - the client never asks to join a specific room. Lazy
// creation (rather than requiring an explicit "connect" call first)
// avoids a race with React effect ordering: a child page's socket
// listener can mount before the layout that "owns" the connection does.
export function getSocket() {
  if (!socket) {
    socket = io({ withCredentials: true });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
}
