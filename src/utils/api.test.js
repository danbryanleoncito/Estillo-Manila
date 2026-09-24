import { api, ApiError, errorMessage, isStockConflict } from "./api";

const respond = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(body),
});

// CRA's jest config sets resetMocks: true, so the stub is installed per test.
beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

test("returns the parsed body on success", async () => {
  global.fetch.mockResolvedValue(respond(200, { hello: "world" }));
  await expect(api("/x")).resolves.toEqual({ hello: "world" });
});

test("treats a response without an `ok` field as success (bare test stubs)", async () => {
  global.fetch.mockResolvedValue({ json: () => Promise.resolve([1, 2]) });
  await expect(api("/x")).resolves.toEqual([1, 2]);
});

test("sends the bearer token and JSON body", async () => {
  localStorage.setItem("token", "abc");
  global.fetch.mockResolvedValue(respond(200, {}));
  await api("/cart/add-to-cart", { method: "POST", body: { productId: "p", quantity: 2 } });
  const [, options] = global.fetch.mock.calls[0];
  expect(options.method).toBe("POST");
  expect(options.headers.Authorization).toBe("Bearer abc");
  expect(options.headers["Content-Type"]).toBe("application/json");
  expect(JSON.parse(options.body)).toEqual({ productId: "p", quantity: 2 });
});

test("does not send the token when auth is false", async () => {
  localStorage.setItem("token", "abc");
  global.fetch.mockResolvedValue(respond(200, {}));
  await api("/product/active", { auth: false });
  expect(global.fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
});

test("throws an ApiError that keeps the status and the whole body (stock 409)", async () => {
  const body = {
    message: "Some items are out of stock",
    outOfStock: [{ productId: "p", name: "Tee", requested: 5, available: 4 }],
  };
  global.fetch.mockResolvedValue(respond(409, body));
  let caught;
  try {
    await api("/payment/create-payment-intent", { method: "POST" });
  } catch (err) {
    caught = err;
  }
  expect(caught).toBeInstanceOf(ApiError);
  expect(caught.status).toBe(409);
  expect(caught.message).toBe("Some items are out of stock");
  expect(caught.data.outOfStock[0].available).toBe(4);
  expect(isStockConflict(caught)).toBe(true);
});

test("emptyOn404 returns the fallback only for a 404", async () => {
  global.fetch.mockResolvedValueOnce(respond(404, { message: "Cart not found" }));
  await expect(api("/cart/get-cart", { emptyOn404: null })).resolves.toBeNull();

  global.fetch.mockResolvedValueOnce(respond(500, { message: "boom" }));
  await expect(api("/cart/get-cart", { emptyOn404: null })).rejects.toMatchObject({ status: 500 });
});

test("a network failure becomes an ApiError with status 0", async () => {
  global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));
  await expect(api("/x")).rejects.toMatchObject({ status: 0 });
});

test("errorMessage understands every error shape the backend uses", () => {
  expect(errorMessage({ message: "a" })).toBe("a");
  expect(errorMessage({ error: { message: "b" } })).toBe("b");
  expect(errorMessage({ error: "c" })).toBe("c");
  expect(errorMessage({ auth: "Failed. No Token" })).toBe("Failed. No Token");
  expect(errorMessage(null, "fallback")).toBe("fallback");
});

test("isStockConflict is false for other errors", () => {
  expect(isStockConflict(new ApiError(409, { message: "x" }, "x"))).toBe(false);
  expect(isStockConflict(new ApiError(500, { outOfStock: [] }, "x"))).toBe(false);
  expect(isStockConflict(new Error("x"))).toBe(false);
});
