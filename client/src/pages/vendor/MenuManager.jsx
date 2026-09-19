import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";
import MenuItemForm from "./MenuItemForm";

export default function MenuManager() {
  const [items, setItems] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState("");
  const [editingItem, setEditingItem] = useState(null); // null = closed, {} = new, item = edit
  const [togglingShop, setTogglingShop] = useState(false);

  const refresh = useCallback(() => {
    api
      .get("/vendor/menu")
      .then((data) => {
        setItems(data.items);
        setIsOpen(data.isOpen);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleToggleShop() {
    setTogglingShop(true);
    setError("");
    try {
      const result = await api.patch("/vendor/shop", { isOpen: !isOpen });
      setIsOpen(result.isOpen);
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingShop(false);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setError("");
    try {
      await api.delete(`/vendor/menu/${item.id}`);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Shop status</p>
          <p className="text-xs text-gray-400">
            {isOpen ? "Open - visible to students" : "Closed - hidden from students"}
          </p>
        </div>
        <button
          onClick={handleToggleShop}
          disabled={togglingShop}
          className={`text-sm font-medium px-3 py-1.5 rounded-lg disabled:opacity-50 ${
            isOpen ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
          }`}
        >
          {isOpen ? "Open" : "Closed"}
        </button>
      </div>

      <button
        onClick={() => setEditingItem({})}
        className="w-full rounded-lg bg-amber-600 text-white py-2 text-sm font-medium hover:bg-amber-700"
      >
        + Add Item
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {items === null ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">No menu items yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatCredits(item.price)} · Stock: {item.stock} ·{" "}
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-xs text-amber-700 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-xs text-red-600 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingItem && (
        <MenuItemForm
          item={editingItem.id ? editingItem : null}
          onClose={() => setEditingItem(null)}
          onSaved={() => {
            setEditingItem(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
