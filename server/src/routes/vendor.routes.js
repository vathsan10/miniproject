import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { attachVendor } from "../middleware/vendor.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { menuItemSchema, updateMenuItemSchema, toggleShopSchema } from "../schemas/menu.schema.js";
import { updateOrderStatusSchema, verifyPickupSchema } from "../schemas/order.schema.js";
import {
  listMyMenu,
  createItem,
  updateItem,
  deleteItem,
  toggleShop,
} from "../controllers/vendorMenu.controller.js";
import { listOrders, updateStatus, verify } from "../controllers/vendorOrder.controller.js";
import { summary } from "../controllers/vendorSales.controller.js";

const router = Router();

router.use(requireAuth, requireRole("VENDOR"), asyncHandler(attachVendor));

router.get("/menu", asyncHandler(listMyMenu));
router.post("/menu", validate(menuItemSchema), asyncHandler(createItem));
router.patch("/menu/:id", validate(updateMenuItemSchema), asyncHandler(updateItem));
router.delete("/menu/:id", asyncHandler(deleteItem));
router.patch("/shop", validate(toggleShopSchema), asyncHandler(toggleShop));

router.get("/orders", asyncHandler(listOrders));
router.patch("/orders/:id/status", validate(updateOrderStatusSchema), asyncHandler(updateStatus));
router.post("/orders/verify", validate(verifyPickupSchema), asyncHandler(verify));

router.get("/sales/summary", asyncHandler(summary));

export default router;
