import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { register, login, logout, me } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/logout", logout);
router.get("/me", requireAuth, asyncHandler(me));

export default router;
