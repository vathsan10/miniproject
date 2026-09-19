// Abstract wallet/coin mark used as UniPay's brand glyph throughout the
// header, loader, and menu - stroke-based like the rest of the icon set.
export default function BrandMark({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 9.5c0-1.1 1.6-2 3.5-2s3.5.9 3.5 2-1.6 2-3.5 2-3.5.9-3.5 2 1.6 2 3.5 2 3.5-.9 3.5-2" />
    </svg>
  );
}
