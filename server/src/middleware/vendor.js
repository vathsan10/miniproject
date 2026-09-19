import { prisma } from "../lib/prisma.js";

// Vendor routes operate on a Vendor row, not the User row from the JWT -
// this resolves req.user to the Vendor record once so handlers can just
// use req.vendor.id, and so every menu/order write is automatically
// scoped to the vendor making the request (never trust a vendorId sent
// in the request body).
export async function attachVendor(req, res, next) {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
  if (!vendor) {
    return res.status(404).json({ error: "Vendor profile not found" });
  }
  req.vendor = vendor;
  next();
}
