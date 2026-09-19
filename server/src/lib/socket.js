import { Server } from "socket.io";
import { verifyToken } from "./jwt.js";
import { prisma } from "./prisma.js";
import { COOKIE_NAME } from "../middleware/auth.js";

let io;

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return null;
}

// Each socket auto-joins the room matching its OWN identity, resolved
// server-side from the same JWT cookie the REST API trusts. The client
// never gets to name a room to join, so a student can't eavesdrop on
// another student's (or a vendor's) order updates.
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = readCookie(socket.handshake.headers.cookie, COOKIE_NAME);
      if (!token) return next(new Error("Unauthorized"));
      const payload = verifyToken(token);
      socket.data.userId = payload.id;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    if (socket.data.role === "STUDENT") {
      socket.join(`student:${socket.data.userId}`);
    } else if (socket.data.role === "VENDOR") {
      const vendor = await prisma.vendor.findUnique({ where: { userId: socket.data.userId } });
      if (vendor) socket.join(`vendor:${vendor.id}`);
    }
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
}

// A new paid order, pushed to the vendor's dashboard the moment it's placed.
export function emitNewOrder(order) {
  getIO().to(`vendor:${order.vendorId}`).emit("order:new", order);
}

// Any status change (vendor action or student cancellation) - sent to
// both sides so a vendor's other open tab and the student's own device
// stay in sync without polling.
export function emitOrderUpdate(order) {
  getIO().to(`student:${order.studentId}`).to(`vendor:${order.vendorId}`).emit("order:status", order);
}
