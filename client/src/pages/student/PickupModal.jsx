import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../../api/client";
import Modal from "../../components/motion/Modal";
import Eyebrow from "../../components/motion/Eyebrow";
import RevealText from "../../components/motion/RevealText";

export default function PickupModal({ orderId, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/orders/${orderId}/pickup`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [orderId]);

  return (
    <Modal onClose={onClose} maxWidth="22rem">
      <div className="text-center">
        <div className="flex items-start justify-between mb-4 text-left">
          <div>
            <Eyebrow>Ready for pickup</Eyebrow>
            <RevealText as="h2" text="Pickup code" className="block text-2xl font-medium tracking-tight mt-1" />
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:bg-[var(--surface)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && !data && <p className="text-sm text-[var(--ink-soft)]">Loading...</p>}
        {data && (
          <>
            <p className="text-sm text-[var(--ink-soft)] mb-3">Show this to the vendor</p>
            <div className="flex justify-center mb-4">
              {/* Encodes ONLY the pickupToken - never the order id, so
                  the QR can't be used to look up or infer other orders. */}
              <QRCodeSVG value={data.pickupToken} size={180} />
            </div>
            <p className="text-xs text-[var(--ink-soft)] mb-1">Or give this backup code</p>
            <p className="text-3xl font-mono font-semibold tracking-widest text-[var(--ink)]">
              {data.backupCode}
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
