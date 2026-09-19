import { z } from "zod";

export const createVendorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  shopName: z.string().trim().min(1, "Shop name is required").max(100),
});
