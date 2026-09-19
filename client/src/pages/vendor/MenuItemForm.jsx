import { useState } from "react";
import { api } from "../../api/client";

const emptyForm = { name: "", description: "", price: "", stock: "", imageUrl: "" };

export default function MenuItemForm({ item, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const [form, setForm] = useState(
    isEdit
      ? {
          name: item.name,
          description: item.description || "",
          price: String(item.price),
          stock: String(item.stock),
          imageUrl: item.imageUrl || "",
        }
      : emptyForm
  );
  const [isAvailable, setIsAvailable] = useState(isEdit ? item.isAvailable : true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl || undefined,
    };
    if (isEdit) payload.isAvailable = isAvailable;

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.patch(`/vendor/menu/${item.id}`, payload);
      } else {
        await api.post("/vendor/menu", payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4 z-10">
      <div className="w-full max-w-sm bg-white rounded-xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit Item" : "Add Item"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              required
              maxLength={100}
              value={form.name}
              onChange={updateField("name")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              maxLength={300}
              value={form.description}
              onChange={updateField("description")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                min={1}
                step={1}
                required
                value={form.price}
                onChange={updateField("price")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                min={0}
                step={1}
                required
                value={form.stock}
                onChange={updateField("stock")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
            <input
              value={form.imageUrl}
              onChange={updateField("imageUrl")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              Available for order
            </label>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-amber-600 text-white py-2 text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Add item"}
          </button>
        </form>
      </div>
    </div>
  );
}
