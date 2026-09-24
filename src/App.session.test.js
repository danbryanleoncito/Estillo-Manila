// Restoring a saved login on page load, and what happens when the server rejects it later.
import { render, screen, waitFor, act } from "@testing-library/react";
import App from "./App";
import { SESSION_EXPIRED_EVENT } from "./utils/api";
import { notyf } from "./utils/notify";
import { mockFetch, reply, offline } from "./testHelpers";

jest.mock("./utils/notify", () => ({
  notyf: { success: jest.fn(), error: jest.fn(), open: jest.fn() },
  toastError: jest.fn(),
}));

const publicRoutes = [["GET /product/active", () => reply(200, [])]];

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, "", "/");
});

test("a saved login the server rejects is cleared", async () => {
  localStorage.setItem("token", "expired");
  mockFetch([
    ...publicRoutes,
    ["GET /users/details", () => reply(403, { auth: "Failed", message: "jwt expired" })],
    ["GET /cart/get-cart", () => reply(403, { auth: "Failed", message: "jwt expired" })],
  ]);
  render(<App />);
  await waitFor(() => expect(localStorage.getItem("token")).toBeNull());
});

test("a saved login that could not be CHECKED (server unreachable) is kept, not thrown away", async () => {
  localStorage.setItem("token", "still-good");
  mockFetch([...publicRoutes, ["GET /users/details", () => offline()], ["GET /cart/get-cart", () => offline()]]);
  render(<App />);
  await screen.findByText(/featured products/i);
  // Give the failed check time to settle, then confirm nothing was cleared.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  expect(localStorage.getItem("token")).toBe("still-good");
});

// The cart link is only in the navbar while someone is logged in.
const cartLink = () => screen.queryAllByRole("link").find((a) => a.getAttribute("href") === "/cart");

test("when the server later rejects the login, the user is signed out once, with a clear message", async () => {
  localStorage.setItem("token", "good-then-bad");
  mockFetch([
    ...publicRoutes,
    ["GET /users/details", () => reply(200, { _id: "u1", isAdmin: false })],
    ["GET /cart/get-cart", () => reply(404, { message: "Cart not found" })],
  ]);
  render(<App />);
  await waitFor(() => expect(cartLink()).toBeTruthy());

  act(() => {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    // Several requests failing at once must not toast several times.
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  });

  await waitFor(() => expect(cartLink()).toBeUndefined());
  expect(localStorage.getItem("token")).toBeNull();
  const expiredToasts = notyf.open.mock.calls.filter(([o]) => /session has expired/i.test(o.message));
  expect(expiredToasts).toHaveLength(1);
});
