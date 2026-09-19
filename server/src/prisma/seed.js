import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PASSWORD = "password123";

async function hashed() {
  return bcrypt.hash(PASSWORD, 10);
}

async function main() {
  const passwordHash = await hashed();

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@unipay.test",
      passwordHash,
      role: "ADMIN",
    },
  });

  const vendor1User = await prisma.user.create({
    data: {
      name: "Main Canteen Owner",
      email: "vendor1@unipay.test",
      passwordHash,
      role: "VENDOR",
    },
  });
  const vendor1 = await prisma.vendor.create({
    data: { userId: vendor1User.id, shopName: "Main Canteen", isOpen: true },
  });

  const vendor2User = await prisma.user.create({
    data: {
      name: "Juice Corner Owner",
      email: "vendor2@unipay.test",
      passwordHash,
      role: "VENDOR",
    },
  });
  const vendor2 = await prisma.vendor.create({
    data: { userId: vendor2User.id, shopName: "Juice Corner", isOpen: true },
  });

  const students = await Promise.all(
    [
      { name: "Aarav Sharma", email: "student1@unipay.test", rollNo: "CS101" },
      { name: "Priya Nair", email: "student2@unipay.test", rollNo: "CS102" },
      { name: "Rohan Iyer", email: "student3@unipay.test", rollNo: "EC103" },
    ].map((s) => prisma.user.create({ data: { ...s, passwordHash, role: "STUDENT" } }))
  );

  // Starting credits, recorded as TOPUP transactions (never a stored balance).
  await prisma.transaction.createMany({
    data: students.map((s) => ({
      userId: s.id,
      type: "TOPUP",
      amount: 200,
      reference: "seed-starting-credit",
    })),
  });

  await prisma.menuItem.createMany({
    data: [
      { vendorId: vendor1.id, name: "Samosa", description: "Crispy fried pastry with spiced potato filling", price: 15, stock: 40 },
      { vendorId: vendor1.id, name: "Veg Puff", description: "Flaky puff pastry with vegetable stuffing", price: 20, stock: 30 },
      { vendorId: vendor1.id, name: "Masala Dosa", description: "Crispy rice crepe with spiced potato filling, served with chutney", price: 45, stock: 25 },
      { vendorId: vendor1.id, name: "Idli Sambar", description: "Steamed rice cakes with lentil sambar", price: 35, stock: 25 },
      { vendorId: vendor1.id, name: "Veg Sandwich", description: "Grilled sandwich with mixed vegetables", price: 30, stock: 20 },
      { vendorId: vendor1.id, name: "Tea", description: "Hot Indian masala chai", price: 10, stock: 100 },
      { vendorId: vendor1.id, name: "Coffee", description: "South Indian filter coffee", price: 15, stock: 100 },
      { vendorId: vendor2.id, name: "Fresh Lime Juice", description: "Sweet and salty lime juice", price: 25, stock: 40 },
      { vendorId: vendor2.id, name: "Mango Shake", description: "Fresh mango blended with milk", price: 40, stock: 20 },
      { vendorId: vendor2.id, name: "Watermelon Juice", description: "Chilled fresh watermelon juice", price: 25, stock: 30 },
    ],
  });

  console.log("Seed complete.");
  console.log("---------------------------------------------");
  console.log("Demo credentials (password for all: " + PASSWORD + ")");
  console.log("Admin:   admin@unipay.test");
  console.log("Vendor:  vendor1@unipay.test (Main Canteen)");
  console.log("Vendor:  vendor2@unipay.test (Juice Corner)");
  console.log("Student: student1@unipay.test");
  console.log("Student: student2@unipay.test");
  console.log("Student: student3@unipay.test");
  console.log("---------------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
