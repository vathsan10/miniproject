import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";
import { useCart } from "../../context/CartContext";
import Eyebrow from "../../components/motion/Eyebrow";
import Reveal from "../../components/motion/Reveal";

export default function Menu() {
  const [vendors, setVendors] = useState(null);
  const [error, setError] = useState("");
  const { items: cartItems, addItem, updateQuantity } = useCart();

  useEffect(() => {
    api
      .get("/menu")
      .then((data) => setVendors(data.vendors))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (vendors === null) return <p className="text-sm text-[var(--ink-soft)]">Loading...</p>;
  if (vendors.length === 0) {
    return <p className="text-sm text-[var(--ink-soft)]">No vendors are open right now.</p>;
  }

  function quantityInCart(itemId) {
    return cartItems.find((i) => i.menuItemId === itemId)?.quantity || 0;
  }

  return (
    <div className="space-y-8">
      {vendors.map((vendor, vi) => (
        <div key={vendor.id}>
          <Eyebrow>{vendor.shopName}</Eyebrow>
          {vendor.menuItems.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)] mt-2">No items yet.</p>
          ) : (
            <ul className="space-y-2 mt-3">
              {vendor.menuItems.map((item, ii) => {
                const outOfStock = item.stock <= 0 || !item.isAvailable;
                const qty = quantityInCart(item.id);
                return (
                  <Reveal
                    key={item.id}
                    as="li"
                    delay={(vi * vendor.menuItems.length + ii) * 30}
                    y={16}
                    className={`bg-white p-4 flex items-center justify-between ${outOfStock ? "opacity-50" : ""}`}
                    style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--hairline)" }}
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--ink)]">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-[var(--ink-soft)] mt-0.5">{item.description}</p>
                      )}
                      {outOfStock && <p className="text-xs text-red-500 mt-0.5">Out of stock</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-[var(--ink)]">{formatCredits(item.price)}</p>
                      {!outOfStock &&
                        (qty === 0 ? (
                          <button
                            onClick={() => addItem(vendor, item)}
                            className="text-xs font-medium uppercase tracking-wide px-3 py-1.5 rounded-full text-white"
                            style={{ background: "var(--role-student)" }}
                          >
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, qty - 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ background: "var(--surface)", color: "var(--ink)" }}
                            >
                              -
                            </button>
                            <span className="text-sm w-4 text-center">{qty}</span>
                            <button
                              onClick={() => updateQuantity(item.id, qty + 1)}
                              disabled={qty >= item.stock}
                              className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-40"
                              style={{ background: "var(--surface)", color: "var(--ink)" }}
                            >
                              +
                            </button>
                          </div>
                        ))}
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
