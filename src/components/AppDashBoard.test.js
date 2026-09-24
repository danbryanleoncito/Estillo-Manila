import { changedFields } from "./AppDashBoard";

const product = { _id: "p", name: "Tee", description: "d", price: 899, image: "x.png", stock: 12 };

test("nothing edited means nothing to send", () => {
  expect(changedFields(product, {})).toEqual({});
  expect(changedFields(product, { name: "Tee", stock: "12" })).toEqual({});
});

test("editing only the name never includes stock (so live stock is not overwritten)", () => {
  expect(changedFields(product, { name: "New name" })).toEqual({ name: "New name" });
});

test("numeric fields are sent as numbers", () => {
  expect(changedFields(product, { price: "999", stock: "7" })).toEqual({ price: 999, stock: 7 });
});

test("clearing stock to 0 is a real change, not 'empty'", () => {
  expect(changedFields(product, { stock: "0" })).toEqual({ stock: 0 });
});
