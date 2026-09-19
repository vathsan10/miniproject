import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";
import MenuItemForm from "./MenuItemForm";
import Eyebrow from "../../components/motion/Eyebrow";
import Reveal from "../../components/motion/Reveal";
import PillButton from "../../components/motion/PillButton";

const cardStyle = { borderRadius: "var(--radius-card)", border: "1px solid var(--hairline)" };

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
      <Reveal as="div" className="bg-white p-5 flex items-center justify-between" style={cardStyle}>
        <div>
          <Eyebrow>Shop status</Eyebrow>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            {isOpen ? "Open - visible to students" : "Closed - hidden from students"}
          </p>
        </div>
        <button
          onClick={handleToggleShop}
          disabled={togglingShop}
          className="text-xs font-medium uppercase tracking-wide px-4 py-2 rounded-full disabled:opacity-50"
          style={
            isOpen
              ? { background: "rgba(11,110,151,0.12)", color: "var(--accent-teal)" }
              : { background: "var(--surface)", color: "var(--ink-soft)" }
          }
        >
          {isOpen ? "Open" : "Closed"}
        </button>
      </Reveal>

      <PillButton
        onClick={() => setEditingItem({})}
        accent="var(--role-vendor)"
        accentDeep="var(--role-vendor-deep)"
        className="w-full"
      >
        Add item
      </PillButton>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {items === null ? (
        <p className="text-sm text-[var(--ink-soft)]">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[var(--ink-soft)]">No menu items yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <Reveal key={item.id} as="li" delay={i * 40} y={16} className="bg-white p-4" style={cardStyle}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--ink)]">{item.name}</p>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                    {formatCredits(item.price)} · Stock: {item.stock} ·{" "}
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--role-vendor)" }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item)} className="text-xs font-medium uppercase tracking-wide text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            </Reveal>
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
