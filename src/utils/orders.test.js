import {
  lineProductId,
  lineUnitPrice,
  openDisputes,
  refundPreview,
  storedLineName,
  timeLeft,
  validateKeep,
} from "./orders";

describe("lineUnitPrice", () => {
  test("uses the stored unit price", () => {
    expect(lineUnitPrice({ unitPrice: 250, quantity: 3, subtotal: 999 })).toBe(250);
  });
  test("falls back to subtotal / quantity on old orders", () => {
    expect(lineUnitPrice({ quantity: 4, subtotal: 1000 })).toBe(250);
  });
  test("is 0 rather than NaN when there is nothing to divide", () => {
    expect(lineUnitPrice({ quantity: 0, subtotal: 0 })).toBe(0);
    expect(lineUnitPrice(undefined)).toBe(0);
  });
});

describe("refundPreview", () => {
  test("refunds the units not kept", () => {
    expect(refundPreview(5, 2, 100)).toBe(300);
  });
  test("keeping everything refunds nothing", () => {
    expect(refundPreview(5, 5, 100)).toBe(0);
  });
  test("never goes negative", () => {
    expect(refundPreview(3, 9, 100)).toBe(0);
  });
});

describe("validateKeep", () => {
  test("accepts whole numbers from 1 to the held units", () => {
    expect(validateKeep("1", 3)).toEqual({ ok: true, n: 1 });
    expect(validateKeep("3", 3)).toEqual({ ok: true, n: 3 });
  });
  test.each(["", "0", "4", "-1", "1.5", "abc"])("rejects %p", (value) => {
    const result = validateKeep(value, 3);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/1 to 3/);
  });
});

describe("timeLeft", () => {
  const now = new Date("2026-01-01T00:00:00Z").getTime();
  test("hours and minutes", () => {
    expect(timeLeft(now + (5 * 60 + 12) * 60000, now)).toEqual({ expired: false, label: "5h 12m left" });
  });
  test("minutes only under an hour, never 0m", () => {
    expect(timeLeft(now + 20 * 60000, now).label).toBe("20m left");
    expect(timeLeft(now + 5000, now).label).toBe("1m left");
  });
  test("expired or invalid", () => {
    expect(timeLeft(now - 1000, now).expired).toBe(true);
    expect(timeLeft("nonsense", now).expired).toBe(true);
  });
});

describe("openDisputes / line helpers", () => {
  test("keeps only Open disputes and tolerates non-arrays", () => {
    const list = [{ status: "Open" }, { status: "Resolved" }, { status: "Resolving" }];
    expect(openDisputes(list)).toEqual([{ status: "Open" }]);
    expect(openDisputes(undefined)).toEqual([]);
  });
  test("storedLineName prefers the stored name, then a populated product", () => {
    expect(storedLineName({ name: "Tee", productId: { name: "Other" } })).toBe("Tee");
    expect(storedLineName({ productId: { name: "Other" } })).toBe("Other");
    expect(storedLineName({ productId: "abc" })).toBeNull();
  });
  test("lineProductId handles populated and plain ids", () => {
    expect(lineProductId({ productId: { _id: "p1" } })).toBe("p1");
    expect(lineProductId({ productId: "p2" })).toBe("p2");
  });
});
