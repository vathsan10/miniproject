import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";

export async function listMyMenu(req, res) {
  const items = await prisma.menuItem.findMany({
    where: { vendorId: req.vendor.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ items, isOpen: req.vendor.isOpen });
}

export async function createItem(req, res) {
  const { name, description, price, stock, imageUrl } = req.body;
  const item = await prisma.menuItem.create({
    data: { vendorId: req.vendor.id, name, description, price, stock, imageUrl },
  });
  res.status(201).json({ item });
}

async function getOwnedItem(vendorId, itemId) {
  const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
  // Same 404 whether the item doesn't exist or belongs to another
  // vendor, so this endpoint can't be used to probe other vendors' ids.
  if (!item || item.vendorId !== vendorId) throw new HttpError(404, "Menu item not found");
  return item;
}

export async function updateItem(req, res) {
  await getOwnedItem(req.vendor.id, req.params.id);
  const item = await prisma.menuItem.update({ where: { id: req.params.id }, data: req.body });
  res.json({ item });
}

export async function deleteItem(req, res) {
  await getOwnedItem(req.vendor.id, req.params.id);
  try {
    await prisma.menuItem.delete({ where: { id: req.params.id } });
  } catch (err) {
    // Foreign key violation: this item is referenced by past OrderItems
    // (Phase 5+) and deleting it would corrupt order history.
    if (err.code === "P2003") {
      throw new HttpError(
        409,
        "This item has existing orders and can't be deleted - mark it unavailable instead"
      );
    }
    throw err;
  }
  res.json({ ok: true });
}

export async function toggleShop(req, res) {
  const vendor = await prisma.vendor.update({
    where: { id: req.vendor.id },
    data: { isOpen: req.body.isOpen },
  });
  res.json({ isOpen: vendor.isOpen });
}
