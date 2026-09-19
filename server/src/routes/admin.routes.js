import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { createVendorSchema } from "../schemas/admin.schema.js";
import { createVendor, listUsers, listVendors } from "../controllers/admin.controller.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.post("/vendors", validate(createVendorSchema), asyncHandler(createVendor));
router.get("/users", asyncHandler(listUsers));
router.get("/vendors", asyncHandler(listVendors));

export default router;
