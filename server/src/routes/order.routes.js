import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { checkoutSchema } from "../schemas/order.schema.js";
import { checkout, myOrders, cancel, pickup } from "../controllers/order.controller.js";

const router = Router();

router.use(requireAuth, requireRole("STUDENT"));

router.post("/", validate(checkoutSchema), asyncHandler(checkout));
router.get("/mine", asyncHandler(myOrders));
router.post("/:id/cancel", asyncHandler(cancel));
router.get("/:id/pickup", asyncHandler(pickup));

export default router;
