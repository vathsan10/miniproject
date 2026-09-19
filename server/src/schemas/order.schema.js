import { z } from "zod";

export const checkoutSchema = z.object({
  vendorId: z.string().min(1),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, "Cart is empty"),
  pickupTime: z.coerce.date(),
});

// COLLECTED is deliberately excluded - it's only ever reached through
// the QR/backup-code pickup verification endpoint (Phase 7), never as a
// generic vendor status update.
export const VENDOR_ORDER_ACTIONS = ["ACCEPTED", "PREPARING", "READY", "REJECTED"];

export const updateOrderStatusSchema = z.object({
  status: z.enum(VENDOR_ORDER_ACTIONS),
});
