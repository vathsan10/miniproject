import { prisma } from "../lib/prisma.js";

// Only open vendors are shown, and each item carries its live
// stock/isAvailable so the student UI can grey out anything that can't
// actually be ordered right now (closed shops are hidden entirely).
export async function publicMenu(req, res) {
  const vendors = await prisma.vendor.findMany({
    where: { isOpen: true },
    select: {
      id: true,
      shopName: true,
      menuItems: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          isAvailable: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { shopName: "asc" },
  });
  res.json({ vendors });
}
