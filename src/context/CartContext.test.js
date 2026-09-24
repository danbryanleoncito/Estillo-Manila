import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserContext from "./UserContext";
import { CartProvider, useCart } from "./CartContext";
import { notyf } from "../utils/notify";
import { mockFetch, reply, offline, callsTo } from "../testHelpers";

jest.mock("../utils/notify", () => ({
  notyf: { success: jest.fn(), error: jest.fn(), open: jest.fn() },
  toastError: jest.fn(),
}));

const cart = {
  totalPrice: 100,
  cartItems: [{ productId: { _id: "p1", name: "Tee", price: 100, stock: 5 }, quantity: 1, subtotal: 100 }],
};

function Probe() {
  const { loaded, error, lines, retry, addToCart } = useCart();
  return (
    <div>
      <p>{loaded ? "loaded" : "loading"}</p>
      <p>{error ? `error: ${error}` : "no error"}</p>
      <p>{`lines: ${lines.length}`}</p>
      <button onClick={retry}>retry</button>
      <button onClick={() => addToCart("p1", 1).catch(() => {})}>add</button>
    </div>
  );
}

const renderCart = () =>
  render(
    <UserContext.Provider value={{ user: { id: "u1", isAdmin: false } }}>
      <CartProvider>
        <Probe />
      </CartProvider>
    </UserContext.Provider>
  );

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("token", "t");
});

test("a cart that fails to load is an error, not an empty cart, and Retry recovers", async () => {
  let up = false;
  mockFetch([["GET /cart/get-cart", () => (up ? reply(200, cart) : offline())]]);
  renderCart();

  expect(await screen.findByText(/error: Cannot reach the server/i)).toBeInTheDocument();
  expect(screen.getByText("lines: 0")).toBeInTheDocument();

  up = true;
  userEvent.click(screen.getByText("retry"));
  expect(await screen.findByText("no error")).toBeInTheDocument();
  expect(screen.getByText("lines: 1")).toBeInTheDocument();
});

test("no cart yet (404) is genuinely empty, not an error", async () => {
  mockFetch([["GET /cart/get-cart", () => reply(404, { message: "Cart not found" })]]);
  renderCart();
  expect(await screen.findByText("loaded")).toBeInTheDocument();
  expect(screen.getByText("no error")).toBeInTheDocument();
});

test("a change that was saved but could not be refreshed is reported as saved, and the error is kept", async () => {
  let refreshWorks = true;
  const fetchMock = mockFetch([
    ["GET /cart/get-cart", () => (refreshWorks ? reply(200, cart) : offline())],
    ["POST /cart/add-to-cart", () => reply(200, { message: "added" })],
  ]);
  renderCart();
  await screen.findByText("lines: 1");

  refreshWorks = false;
  userEvent.click(screen.getByText("add"));

  await waitFor(() => expect(notyf.open).toHaveBeenCalled());
  expect(notyf.open.mock.calls[0][0].message).toMatch(/saved/i);
  expect(callsTo(fetchMock, "add-to-cart")).toHaveLength(1);
  expect(await screen.findByText(/error: Cannot reach the server/i)).toBeInTheDocument();
});
