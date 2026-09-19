import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(300).optional(),
  price: z.number().int("Price must be a whole number").min(1).max(10000),
  stock: z.number().int("Stock must be a whole number").min(0).max(10000),
  imageUrl: z.string().trim().max(500).optional(),
});

export const updateMenuItemSchema = menuItemSchema.partial().extend({
  isAvailable: z.boolean().optional(),
});

export const toggleShopSchema = z.object({
  isOpen: z.boolean(),
});
