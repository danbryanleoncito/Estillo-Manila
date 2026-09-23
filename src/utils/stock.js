// Mirrors the backend's limits (backend/utils/limits.js). The server enforces them; these
// helpers only keep the UI from offering what the server will refuse.

export const MAX_QTY_PER_LINE = 99;
export const LOW_STOCK_THRESHOLD = 5;

// The most a customer can buy of one product right now: live stock, capped at 99.
export const maxPurchasable = (stock) =>
  Math.min(MAX_QTY_PER_LINE, Math.max(0, Number(stock) || 0));

// "out" (nothing left), "low" (5 or fewer), or "ok".
export const stockState = (stock) => {
  const n = Math.max(0, Number(stock) || 0);
  if (n === 0) return "out";
  if (n <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
};
