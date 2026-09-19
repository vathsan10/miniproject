export function formatCredits(amount) {
  return `₹${amount}`;
}

export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
