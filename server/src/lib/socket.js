import { Server } from "socket.io";

let io;

// Students and vendors each join a room keyed by their own user/vendor id
// so events can be targeted without broadcasting to everyone connected.
// Room-join logic and the order/status events themselves are wired up in
// Phase 6 alongside the vendor dashboard.
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", (room) => {
      socket.join(room);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
}
