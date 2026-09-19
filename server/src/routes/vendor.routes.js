import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { attachVendor } from "../middleware/vendor.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { menuItemSchema, updateMenuItemSchema, toggleShopSchema } from "../schemas/menu.schema.js";
import {
  listMyMenu,
  createItem,
  updateItem,
  deleteItem,
  toggleShop,
} from "../controllers/vendorMenu.controller.js";

const router = Router();

router.use(requireAuth, requireRole("VENDOR"), asyncHandler(attachVendor));

router.get("/menu", asyncHandler(listMyMenu));
router.post("/menu", validate(menuItemSchema), asyncHandler(createItem));
router.patch("/menu/:id", validate(updateMenuItemSchema), asyncHandler(updateItem));
router.delete("/menu/:id", asyncHandler(deleteItem));
router.patch("/shop", validate(toggleShopSchema), asyncHandler(toggleShop));

export default router;
