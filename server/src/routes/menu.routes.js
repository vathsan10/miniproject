import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { publicMenu } from "../controllers/menu.controller.js";

const router = Router();

router.get("/", requireAuth, requireRole("STUDENT"), asyncHandler(publicMenu));

export default router;
