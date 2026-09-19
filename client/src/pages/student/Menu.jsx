import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";
import { useCart } from "../../context/CartContext";

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
  if (vendors === null) return <p className="text-sm text-gray-400">Loading...</p>;
  if (vendors.length === 0) {
    return <p className="text-sm text-gray-400">No vendors are open right now.</p>;
  }

  function quantityInCart(itemId) {
    return cartItems.find((i) => i.menuItemId === itemId)?.quantity || 0;
  }

  return (
    <div className="space-y-6">
      {vendors.map((vendor) => (
        <div key={vendor.id}>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">{vendor.shopName}</h2>
          {vendor.menuItems.length === 0 ? (
            <p className="text-sm text-gray-400">No items yet.</p>
          ) : (
            <ul className="space-y-2">
              {vendor.menuItems.map((item) => {
                const outOfStock = item.stock <= 0 || !item.isAvailable;
                const qty = quantityInCart(item.id);
                return (
                  <li
                    key={item.id}
                    className={`bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between ${
                      outOfStock ? "opacity-50" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-400">{item.description}</p>
                      )}
                      {outOfStock && <p className="text-xs text-red-500 mt-0.5">Out of stock</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCredits(item.price)}
                      </p>
                      {!outOfStock &&
                        (qty === 0 ? (
                          <button
                            onClick={() => addItem(vendor, item)}
                            className="text-xs font-medium px-2 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, qty - 1)}
                              className="w-6 h-6 rounded-full bg-gray-100 text-gray-700"
                            >
                              -
                            </button>
                            <span className="text-sm w-4 text-center">{qty}</span>
                            <button
                              onClick={() => updateQuantity(item.id, qty + 1)}
                              disabled={qty >= item.stock}
                              className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                        ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
