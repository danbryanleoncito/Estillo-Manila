import { maxPurchasable, stockState, MAX_QTY_PER_LINE, LOW_STOCK_THRESHOLD } from "./stock";

test("maxPurchasable is live stock capped at 99", () => {
  expect(maxPurchasable(150)).toBe(99);
  expect(maxPurchasable(99)).toBe(99);
  expect(maxPurchasable(42)).toBe(42);
  expect(maxPurchasable(0)).toBe(0);
  expect(MAX_QTY_PER_LINE).toBe(99);
});

test("maxPurchasable tolerates missing or bad stock (old products)", () => {
  expect(maxPurchasable(undefined)).toBe(0);
  expect(maxPurchasable(null)).toBe(0);
  expect(maxPurchasable(-3)).toBe(0);
  expect(maxPurchasable("7")).toBe(7);
});

test("stockState buckets stock into out / low / ok", () => {
  expect(stockState(0)).toBe("out");
  expect(stockState(undefined)).toBe("out");
  expect(stockState(1)).toBe("low");
  expect(stockState(LOW_STOCK_THRESHOLD)).toBe("low");
  expect(stockState(LOW_STOCK_THRESHOLD + 1)).toBe("ok");
});
