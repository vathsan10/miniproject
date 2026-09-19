import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";

const SCANNER_ELEMENT_ID = "qr-reader";

export default function Scan() {
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const scannerRef = useRef(null);

  async function verify(code) {
    if (verifying) return; // ignore extra QR frames while a request is in flight
    setVerifying(true);
    setError("");
    setResult(null);
    try {
      const data = await api.post("/vendor/orders/verify", { code });
      setResult(data.order);
      stopScanner();
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  }

  function stopScanner() {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setScanning(false);
    if (scanner) {
      scanner.stop().catch(() => {});
    }
  }

  async function startScanner() {
    setError("");
    setResult(null);
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => verify(decodedText),
        () => {} // per-frame "no QR found" - not an error, ignore
      );
      setScanning(true);
    } catch (err) {
      scannerRef.current = null;
      setError("Could not access the camera: " + err.message);
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    verify(manualCode.trim());
    setManualCode("");
  }

  return (
    <div className="space-y-4">
      {!scanning ? (
        <button
          onClick={startScanner}
          className="w-full rounded-lg bg-amber-600 text-white py-2 text-sm font-medium hover:bg-amber-700"
        >
          Start Camera Scan
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="w-full rounded-lg bg-gray-200 text-gray-700 py-2 text-sm font-medium"
        >
          Stop Camera
        </button>
      )}
      <div id={SCANNER_ELEMENT_ID} className={scanning ? "rounded-xl overflow-hidden" : "hidden"} />

      <form onSubmit={handleManualSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <label className="block text-sm font-medium text-gray-700">Or enter the 6-digit backup code</label>
        <div className="flex gap-2">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            maxLength={6}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={verifying}
            className="rounded-lg bg-amber-600 text-white px-4 text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
          >
            Verify
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800">Collected - hand over:</p>
          <p className="text-sm text-gray-700 mt-1">
            {result.student?.name} ({result.student?.rollNo})
          </p>
          <ul className="mt-2 space-y-0.5">
            {result.items.map((oi) => (
              <li key={oi.id} className="text-sm text-gray-800">
                {oi.quantity}x {oi.menuItem.name}
              </li>
            ))}
          </ul>
          <p className="text-sm font-semibold text-gray-900 mt-2">{formatCredits(result.total)}</p>
        </div>
      )}
    </div>
  );
}
