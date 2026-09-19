import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "../../api/client";
import { formatCredits } from "../../lib/format";
import Eyebrow from "../../components/motion/Eyebrow";
import Reveal from "../../components/motion/Reveal";
import PillButton from "../../components/motion/PillButton";

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
        <PillButton onClick={startScanner} accent="var(--role-vendor)" accentDeep="var(--role-vendor-deep)" className="w-full">
          Start camera scan
        </PillButton>
      ) : (
        <PillButton onClick={stopScanner} variant="outline" showArrow={false} className="w-full">
          Stop camera
        </PillButton>
      )}
      <div id={SCANNER_ELEMENT_ID} className={scanning ? "overflow-hidden" : "hidden"} style={{ borderRadius: "var(--radius-card)" }} />

      <Reveal
        as="form"
        onSubmit={handleManualSubmit}
        className="bg-white p-5 space-y-2"
        style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--hairline)" }}
      >
        <Eyebrow>Backup code</Eyebrow>
        <label className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">
          Or enter the 6-digit code
        </label>
        <div className="flex gap-2">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            maxLength={6}
            className="flex-1 rounded-xl border px-4 py-3 text-sm tracking-widest text-center focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--hairline)", "--tw-ring-color": "var(--role-vendor)" }}
          />
          <PillButton type="submit" disabled={verifying} showArrow={false} accent="var(--role-vendor)" accentDeep="var(--role-vendor-deep)">
            Verify
          </PillButton>
        </div>
      </Reveal>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <Reveal
          as="div"
          className="p-5"
          style={{ borderRadius: "var(--radius-card)", background: "rgba(16,163,74,0.08)", border: "1px solid rgba(16,163,74,0.25)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#0f8a3f" }}>
            Collected - hand over:
          </p>
          <p className="text-sm text-[var(--ink)] mt-1">
            {result.student?.name} ({result.student?.rollNo})
          </p>
          <ul className="mt-2 space-y-0.5">
            {result.items.map((oi) => (
              <li key={oi.id} className="text-sm text-[var(--ink)]">
                {oi.quantity}x {oi.menuItem.name}
              </li>
            ))}
          </ul>
          <p className="text-sm font-semibold text-[var(--ink)] mt-2">{formatCredits(result.total)}</p>
        </Reveal>
      )}
    </div>
  );
}
