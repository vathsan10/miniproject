import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { prisma } from "../../src/lib/prisma.js";

// Every test creates its own isolated student/vendor/menu item with a
// random email, rather than depending on the shared seed data - so
// tests never interfere with each other regardless of run order.
export const TEST_PASSWORD = "testpassword123";

export async function createStudent() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      name: "Test Student",
      email: `student-${randomUUID()}@test.local`,
      rollNo: "T-1",
      passwordHash,
      role: "STUDENT",
    },
  });
  return { ...user, password: TEST_PASSWORD };
}

export async function creditStudent(userId, amount) {
  await prisma.transaction.create({
    data: { userId, type: "TOPUP", amount, reference: "test-fixture" },
  });
}

export async function createVendorWithItem({ price = 20, stock = 5 } = {}) {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      name: "Test Vendor Owner",
      email: `vendor-${randomUUID()}@test.local`,
      passwordHash,
      role: "VENDOR",
    },
  });
  const vendor = await prisma.vendor.create({
    data: { userId: user.id, shopName: "Test Shop", isOpen: true },
  });
  const item = await prisma.menuItem.create({
    data: { vendorId: vendor.id, name: "Test Item", price, stock },
  });
  return { user: { ...user, password: TEST_PASSWORD }, vendor, item };
}
