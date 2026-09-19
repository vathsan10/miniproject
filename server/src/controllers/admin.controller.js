import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

// Vendors can't self-register (spec) - this is the only way a vendor
// account gets created.
export async function createVendor(req, res) {
  const { name, email, password, shopName } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // A vendor account is useless without its Vendor row (shopName,
  // isOpen), so both are created together or not at all.
  const vendor = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { name, email, passwordHash, role: "VENDOR" } });
    return tx.vendor.create({ data: { userId: user.id, shopName }, include: { user: true } });
  });

  res.status(201).json({
    vendor: {
      id: vendor.id,
      shopName: vendor.shopName,
      isOpen: vendor.isOpen,
      user: toPublicUser(vendor.user),
    },
  });
}

export async function listUsers(req, res) {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ users: users.map(toPublicUser) });
}

export async function listVendors(req, res) {
  const vendors = await prisma.vendor.findMany({
    include: { user: { select: { name: true, email: true, createdAt: true } } },
    orderBy: { shopName: "asc" },
  });
  res.json({ vendors });
}
