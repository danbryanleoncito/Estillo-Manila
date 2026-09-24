import { maxPurchasable, stockState } from "./stock";

// Why a cart line cannot be checked out right now, or null if it is fine. `line.productId` is
// the populated product from GET /cart/get-cart. The server re-checks all of this at purchase
// time; this only lets the UI explain it (and offer a fix) before the customer tries to pay.
export function getLineIssue(line) {
  const product = line && line.productId;
  if (!product) return { type: "missing", message: "This item is no longer available" };
  if (product.isActive === false) {
    return { type: "archived", message: "This item is no longer available" };
  }
  const limit = maxPurchasable(product.stock);
  if (limit === 0) return { type: "out", message: "Sold out" };
  if (line.quantity > limit) {
    return { type: "over", message: `Only ${limit} available`, fixTo: limit };
  }
  return null;
}

// Low-stock heads-up for a line that is still purchasable ("Only 3 left").
export function getLowStockNote(line) {
  const product = line && line.productId;
  if (!product || getLineIssue(line)) return null;
  return stockState(product.stock) === "low" ? `Only ${product.stock} left` : null;
}
