import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { topupInitSchema, topupVerifySchema } from "../schemas/wallet.schema.js";
import { balance, transactions, topupInit, topupVerify } from "../controllers/wallet.controller.js";

const router = Router();

// The wallet only exists for students - vendors/admins have no balance.
router.use(requireAuth, requireRole("STUDENT"));

router.get("/balance", asyncHandler(balance));
router.get("/transactions", asyncHandler(transactions));
router.post("/topup/init", validate(topupInitSchema), asyncHandler(topupInit));
router.post("/topup/verify", validate(topupVerifySchema), asyncHandler(topupVerify));

export default router;
