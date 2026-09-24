import { pickFeatured } from "./Products";

const p = (id, stock, over = {}) => ({ _id: id, stock, isActive: true, ...over });

test("prefers in-stock products when there are enough", () => {
  const data = [p("a", 0), p("b", 5), p("c", 9), p("d", 20), p("e", 0)];
  const picked = pickFeatured(data, 3);
  expect(picked).toHaveLength(3);
  expect(picked.every((x) => x.stock > 0)).toBe(true);
});

test("falls back to everything when fewer than three are in stock", () => {
  const data = [p("a", 0), p("b", 5), p("c", 0), p("d", 0)];
  expect(pickFeatured(data, 3)).toHaveLength(3);
});

test("never features archived products", () => {
  const data = [p("a", 9, { isActive: false }), p("b", 9), p("c", 9), p("d", 9)];
  expect(pickFeatured(data, 3).some((x) => x._id === "a")).toBe(false);
});

test("handles a short catalog", () => {
  expect(pickFeatured([p("a", 3)], 3)).toHaveLength(1);
  expect(pickFeatured([], 3)).toEqual([]);
});
