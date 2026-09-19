// Single source of truth for the string-enum values stored in the DB
// (Prisma + SQLite has no native enum support - see schema.prisma).

export const ROLES = ["STUDENT", "VENDOR", "ADMIN"];

export const ORDER_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COLLECTED",
  "REJECTED",
  "CANCELLED",
];

// Allowed forward transitions. Anything not listed here is rejected by
// the backend regardless of what the frontend sends.
export const ORDER_STATUS_TRANSITIONS = {
  PLACED: ["ACCEPTED", "REJECTED", "CANCELLED"],
  ACCEPTED: ["PREPARING"],
  PREPARING: ["READY"],
  READY: ["COLLECTED"],
  COLLECTED: [],
  REJECTED: [],
  CANCELLED: [],
};

export const TXN_TYPES = ["TOPUP", "PURCHASE", "REFUND"];

export const PAYMENT_STATUSES = ["CREATED", "PAID", "FAILED"];
