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
