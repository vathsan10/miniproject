import { useState } from "react";
import { api } from "../../api/client";
import Modal from "../../components/motion/Modal";
import Eyebrow from "../../components/motion/Eyebrow";
import RevealText from "../../components/motion/RevealText";
import PillButton from "../../components/motion/PillButton";

const emptyForm = { name: "", description: "", price: "", stock: "", imageUrl: "" };
const inputStyle = { borderColor: "var(--hairline)", "--tw-ring-color": "var(--role-vendor)" };

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
    <Modal onClose={onClose} maxWidth="24rem">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Eyebrow>Menu</Eyebrow>
          <RevealText
            as="h2"
            text={isEdit ? "Edit item" : "Add item"}
            className="block text-2xl font-medium tracking-tight mt-1"
          />
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:bg-[var(--surface)]"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
            Name
          </label>
          <input
            required
            maxLength={100}
            value={form.name}
            onChange={updateField("name")}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
            Description
          </label>
          <input
            maxLength={300}
            value={form.description}
            onChange={updateField("description")}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={inputStyle}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
              Price (₹)
            </label>
            <input
              type="number"
              min={1}
              step={1}
              required
              value={form.price}
              onChange={updateField("price")}
              className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
              Stock
            </label>
            <input
              type="number"
              min={0}
              step={1}
              required
              value={form.stock}
              onChange={updateField("stock")}
              className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
            Image URL (optional)
          </label>
          <input
            value={form.imageUrl}
            onChange={updateField("imageUrl")}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={inputStyle}
          />
        </div>
        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
            <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
            Available for order
          </label>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <PillButton
          type="submit"
          disabled={submitting}
          accent="var(--role-vendor)"
          accentDeep="var(--role-vendor-deep)"
          className="w-full"
        >
          {submitting ? "Saving..." : isEdit ? "Save changes" : "Add item"}
        </PillButton>
      </form>
    </Modal>
  );
}
