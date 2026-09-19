// 6-digit fallback for pickup verification when a student can't show
// their QR code (Phase 7). Not required to be globally unique - lookup
// is always scoped to a specific vendor + READY status.
export function generateBackupCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
