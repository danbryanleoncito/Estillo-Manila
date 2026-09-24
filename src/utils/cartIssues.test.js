import { getLineIssue, getLowStockNote } from "./cartIssues";

const line = (product, quantity = 2) => ({ productId: product, quantity });
const product = (over = {}) => ({ _id: "p", name: "Tee", stock: 10, isActive: true, ...over });

test("an ordinary line has no issue", () => {
  expect(getLineIssue(line(product()))).toBeNull();
});

test("a deleted product (populated as null) is unavailable", () => {
  expect(getLineIssue(line(null))).toMatchObject({ type: "missing" });
});

test("an archived product is unavailable whatever its stock", () => {
  expect(getLineIssue(line(product({ isActive: false, stock: 50 })))).toMatchObject({
    type: "archived",
  });
});

test("zero stock is sold out", () => {
  expect(getLineIssue(line(product({ stock: 0 })))).toMatchObject({ type: "out", message: "Sold out" });
});

test("more in the cart than in stock offers a fix down to the stock", () => {
  expect(getLineIssue(line(product({ stock: 3 }), 5))).toMatchObject({
    type: "over",
    fixTo: 3,
    message: "Only 3 available",
  });
});

test("the 99 cap counts as a limit even with more stock", () => {
  expect(getLineIssue(line(product({ stock: 150 }), 120))).toMatchObject({ type: "over", fixTo: 99 });
});

test("low stock note only appears for buyable lines with 5 or fewer left", () => {
  expect(getLowStockNote(line(product({ stock: 4 }), 1))).toBe("Only 4 left");
  expect(getLowStockNote(line(product({ stock: 40 }), 1))).toBeNull();
  expect(getLowStockNote(line(product({ stock: 2 }), 5))).toBeNull(); // has an issue instead
});
