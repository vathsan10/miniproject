import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { initSocket } from "./lib/socket.js";
import authRoutes from "./routes/auth.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/orders", orderRoutes);
// Further route modules are mounted here as each phase adds them.

// Centralized error handler: any thrown/rejected error from an
// asyncHandler-wrapped route lands here instead of crashing the process.
app.use((err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

initSocket(httpServer);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`UniPay server listening on port ${PORT}`);
});
