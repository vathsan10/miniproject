import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";

export default function Menu() {
  const [vendors, setVendors] = useState(null);
  const [error, setError] = useState("");

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
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCredits(item.price)}
                    </p>
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
