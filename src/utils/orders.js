// Pure helpers for showing orders and shortfall disputes. The server does the real work
// (refund amounts, stock release); these only preview it and validate input before sending.

// Price per unit for an order line. Orders placed before `unitPrice` was stored fall back to
// subtotal / quantity.
export const lineUnitPrice = (line) => {
  if (line && typeof line.unitPrice === "number") return line.unitPrice;
  return line && line.quantity ? line.subtotal / line.quantity : 0;
};

// What the customer gets back if they keep `keep` of the `requested` units.
export const refundPreview = (requested, keep, unitPrice) =>
  Math.max(0, (Number(requested) - Number(keep)) * Number(unitPrice));

// Whole days/hours/minutes until `expiresAt`, as a short label.
export function timeLeft(expiresAt, now = Date.now()) {
  const ms = new Date(expiresAt).getTime() - now;
  if (!Number.isFinite(ms) || ms <= 0) return { expired: true, label: "expiring now" };
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours >= 1) return { expired: false, label: `${hours}h ${minutes % 60}m left` };
  return { expired: false, label: `${Math.max(minutes, 1)}m left` };
}

// How many units to keep when "keeping fewer": a whole number from 1 to the units being held.
export function validateKeep(value, reserved) {
  const n = Number(value);
  if (value === "" || !Number.isInteger(n) || n < 1 || n > reserved) {
    return {
      ok: false,
      message: `Choose a whole number from 1 to ${reserved} (the units being held for you).`,
    };
  }
  return { ok: true, n };
}

export const openDisputes = (disputes) =>
  (Array.isArray(disputes) ? disputes : []).filter((d) => d.status === "Open");

// The name to show for an order line: the name stored at purchase time, or a populated product.
export const storedLineName = (line) =>
  (line && line.name) || (line && line.productId && line.productId.name) || null;

export const lineProductId = (line) =>
  line && line.productId && typeof line.productId === "object"
    ? line.productId._id
    : line && line.productId;
