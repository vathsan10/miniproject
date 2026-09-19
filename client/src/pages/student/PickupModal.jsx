import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../../api/client";

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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4 z-10">
      <div className="w-full max-w-sm bg-white rounded-xl p-5 text-center">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pickup Code</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            ✕
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && !data && <p className="text-sm text-gray-400">Loading...</p>}
        {data && (
          <>
            <p className="text-sm text-gray-500 mb-3">Show this to the vendor</p>
            <div className="flex justify-center mb-4">
              {/* Encodes ONLY the pickupToken - never the order id, so
                  the QR can't be used to look up or infer other orders. */}
              <QRCodeSVG value={data.pickupToken} size={180} />
            </div>
            <p className="text-xs text-gray-400 mb-1">Or give this backup code</p>
            <p className="text-3xl font-mono font-semibold tracking-widest text-gray-900">
              {data.backupCode}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
