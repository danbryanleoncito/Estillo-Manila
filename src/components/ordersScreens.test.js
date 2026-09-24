// Cart, profile (customer orders + disputes) and admin orders: failure states and the dispute
// "Refund processing" state.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UserContext from "../context/UserContext";
import ProfileView from "./ProfileView";
import AppOrder from "./AppOrder";
import AppCart from "./AppCart";
import { useCart } from "../context/CartContext";
import { mockFetch, reply, offline } from "../testHelpers";

jest.mock("../utils/notify", () => ({
  notyf: { success: jest.fn(), error: jest.fn(), open: jest.fn() },
  toastError: jest.fn(),
}));
jest.mock("../context/CartContext", () => ({ useCart: jest.fn() }));

const cartState = (over = {}) => ({
  lines: [],
  loaded: true,
  error: null,
  retry: jest.fn(),
  missingCount: 0,
  totalPrice: 0,
  clearCart: jest.fn(),
  removeItem: jest.fn(),
  setQuantity: jest.fn(),
  ...over,
});

describe("cart page", () => {
  const renderCart = () =>
    render(
      <MemoryRouter>
        <AppCart />
      </MemoryRouter>
    );

  test("a cart that failed to load is an error with Retry, not 'Your cart is empty'", () => {
    const retry = jest.fn();
    useCart.mockReturnValue(cartState({ error: "Cannot reach the server", retry }));
    renderCart();
    expect(screen.getByText("We could not load your cart.")).toBeInTheDocument();
    expect(screen.queryByText("Your cart is empty")).not.toBeInTheDocument();
    userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalled();
  });

  test("a genuinely empty cart still says so", () => {
    useCart.mockReturnValue(cartState());
    renderCart();
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  test("a failed refresh keeps the last known lines but warns they may be stale", () => {
    const line = {
      productId: { _id: "p1", name: "Tee", price: 100, stock: 5, image: "x.png", description: "d" },
      quantity: 1,
      subtotal: 100,
    };
    useCart.mockReturnValue(cartState({ lines: [line], totalPrice: 100, error: "offline" }));
    renderCart();
    expect(screen.getByText(/may be out of date/i)).toBeInTheDocument();
    expect(screen.getByText("Tee")).toBeInTheDocument();
  });
});

const customer = { user: { id: "u1", isAdmin: false }, authReady: true };

const order = (over = {}) => ({
  _id: "o1",
  orderedOn: "2026-09-24T00:00:00Z",
  status: "Pending",
  paymentStatus: "Paid",
  totalPrice: 500,
  productsOrdered: [
    {
      _id: "l1",
      productId: "p1",
      name: "Cargo Pants",
      quantity: 4,
      requestedQuantity: 5,
      unitPrice: 100,
      subtotal: 400,
      lineStatus: "Disputed",
    },
  ],
  ...over,
});

describe("profile", () => {
  const renderProfile = () =>
    render(
      <UserContext.Provider value={customer}>
        <MemoryRouter>
          <ProfileView />
        </MemoryRouter>
      </UserContext.Provider>
    );

  const profileRoutes = [["GET /users/details", () => reply(200, { firstName: "Ada", lastName: "L", email: "a@b.c", mobileNo: "09", image: "" })]];

  test("orders that fail to load are an error with Retry, not 'no orders yet'", async () => {
    let up = false;
    mockFetch([
      ...profileRoutes,
      ["GET /order/my-orders", () => (up ? reply(200, { orders: [order({ productsOrdered: [] })] }) : offline())],
      ["GET /order/disputes", () => reply(200, { disputes: [] })],
    ]);
    renderProfile();
    expect(await screen.findByText("We could not load your orders.")).toBeInTheDocument();
    expect(screen.queryByText(/have not placed any orders/i)).not.toBeInTheDocument();

    up = true;
    userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Pending")).toBeInTheDocument();
  });

  test("no orders (404) is genuinely empty", async () => {
    mockFetch([
      ...profileRoutes,
      ["GET /order/my-orders", () => reply(404, { message: "No orders found for this user" })],
      ["GET /order/disputes", () => reply(200, { disputes: [] })],
    ]);
    renderProfile();
    expect(await screen.findByText(/have not placed any orders/i)).toBeInTheDocument();
  });

  test("a profile that fails to load says so", async () => {
    mockFetch([
      ["GET /users/details", () => offline()],
      ["GET /order/my-orders", () => reply(404, { message: "none" })],
      ["GET /order/disputes", () => reply(200, { disputes: [] })],
    ]);
    renderProfile();
    expect(await screen.findByText("We could not load your profile details.")).toBeInTheDocument();
  });

  test("a dispute the customer already answered shows 'Refund processing', with no Resolve button", async () => {
    mockFetch([
      ...profileRoutes,
      ["GET /order/my-orders", () => reply(200, { orders: [order()] })],
      [
        "GET /order/disputes",
        () =>
          reply(200, {
            disputes: [{ _id: "d1", status: "Resolving", lineId: "l1", productName: "Cargo Pants", requestedQuantity: 5, reservedQuantity: 4, unitPrice: 100, expiresAt: "2099-01-01T00:00:00Z" }],
          }),
      ],
    ]);
    renderProfile();
    expect(await screen.findByText("Refund processing")).toBeInTheDocument();
    expect(screen.queryByText("Needs your decision")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Resolve" })).not.toBeInTheDocument();
  });

  test("shows where each order is being delivered, and says so for an order with no address", async () => {
    mockFetch([
      ...profileRoutes,
      [
        "GET /order/my-orders",
        () =>
          reply(200, {
            orders: [
              order({ _id: "o-new", productsOrdered: [], shippingAddress: { fullName: "Ada Lovelace", phone: "09171234567", addressLine1: "12 Rizal Street", addressLine2: "Unit 4B", city: "Makati", province: "Metro Manila", postalCode: "1200", country: "Philippines" } }),
              order({ _id: "o-old", orderedOn: "2020-01-01T00:00:00Z", productsOrdered: [] }),
            ],
          }),
      ],
      ["GET /order/disputes", () => reply(200, { disputes: [] })],
    ]);
    renderProfile();
    expect(await screen.findByText("12 Rizal Street")).toBeInTheDocument();
    expect(screen.getByText("Unit 4B")).toBeInTheDocument();
    expect(screen.getByText("Makati, Metro Manila, 1200")).toBeInTheDocument();
    expect(screen.getByText("No address on file")).toBeInTheDocument();
  });

  test("an open dispute still offers Resolve", async () => {
    mockFetch([
      ...profileRoutes,
      ["GET /order/my-orders", () => reply(200, { orders: [order()] })],
      [
        "GET /order/disputes",
        () =>
          reply(200, {
            disputes: [{ _id: "d1", status: "Open", lineId: "l1", productName: "Cargo Pants", requestedQuantity: 5, reservedQuantity: 4, unitPrice: 100, expiresAt: "2099-01-01T00:00:00Z" }],
          }),
      ],
    ]);
    renderProfile();
    expect((await screen.findAllByRole("button", { name: "Resolve" })).length).toBeGreaterThan(0);
  });
});

describe("admin orders", () => {
  const renderAdmin = () =>
    render(
      <UserContext.Provider value={{ user: { id: "a1", isAdmin: true }, authReady: true }}>
        <MemoryRouter>
          <AppOrder />
        </MemoryRouter>
      </UserContext.Provider>
    );

  test("orders that fail to load are an error with Retry, not 'no orders'", async () => {
    mockFetch([
      ["GET /order/all-orders", () => reply(500, { message: "x" })],
      ["GET /order/disputes/all", () => reply(200, { disputes: [] })],
      ["GET /order/incidents", () => reply(200, { incidents: [] })],
    ]);
    renderAdmin();
    expect(await screen.findByText("We could not load the orders.")).toBeInTheDocument();
    expect(screen.queryByText("There are no orders yet.")).not.toBeInTheDocument();
  });

  test("shows the problems that need attention", async () => {
    mockFetch([
      ["GET /order/all-orders", () => reply(200, { orders: [order({ productsOrdered: [] })] })],
      ["GET /order/disputes/all", () => reply(200, { disputes: [] })],
      [
        "GET /order/incidents",
        () =>
          reply(200, {
            incidents: [
              { _id: "i1", type: "refund-failed", message: "Refund of ₱200 did not go through", count: 3, lastSeen: "2026-09-24T01:00:00Z" },
            ],
          }),
      ],
    ]);
    renderAdmin();
    expect(await screen.findByText("1 problem needs attention")).toBeInTheDocument();
    expect(screen.getByText(/Refund of ₱200 did not go through/)).toBeInTheDocument();
    expect(screen.getByText(/3 times/)).toBeInTheDocument();
  });

  test("a failing incidents call does not hide the orders", async () => {
    mockFetch([
      ["GET /order/all-orders", () => reply(200, { orders: [order({ productsOrdered: [] })] })],
      ["GET /order/disputes/all", () => reply(200, { disputes: [] })],
      ["GET /order/incidents", () => offline()],
    ]);
    renderAdmin();
    expect(await screen.findByText("Pending")).toBeInTheDocument();
    expect(await screen.findByText(/could not check for problems/i)).toBeInTheDocument();
  });

  test("a line whose refund is already processing is not shown as waiting for the customer", async () => {
    mockFetch([
      ["GET /order/all-orders", () => reply(200, { orders: [order()] })],
      [
        "GET /order/disputes/all",
        () => reply(200, { disputes: [{ _id: "d1", status: "Resolving", orderId: "o1", lineId: "l1" }] }),
      ],
      ["GET /order/incidents", () => reply(200, { incidents: [] })],
    ]);
    renderAdmin();
    expect(await screen.findByText("Refund processing")).toBeInTheDocument();
    expect(screen.queryByText("Needs your decision")).not.toBeInTheDocument();
  });

  test("shows the delivery address (name, phone, street, city) so an order can be sent out", async () => {
    mockFetch([
      ["GET /order/all-orders", () => reply(200, { orders: [order({ productsOrdered: [], shippingAddress: { fullName: "Ada Lovelace", phone: "09171234567", addressLine1: "12 Rizal Street", addressLine2: "Unit 4B", city: "Makati", province: "Metro Manila", postalCode: "1200", country: "Philippines" } })] })],
      ["GET /order/disputes/all", () => reply(200, { disputes: [] })],
      ["GET /order/incidents", () => reply(200, { incidents: [] })],
    ]);
    renderAdmin();
    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("09171234567")).toBeInTheDocument();
    expect(screen.getByText("12 Rizal Street")).toBeInTheDocument();
    expect(screen.getByText("Makati, Metro Manila, 1200")).toBeInTheDocument();
  });

  test("a backend that predates incidents (404) is not an error", async () => {
    mockFetch([
      ["GET /order/all-orders", () => reply(200, { orders: [order({ productsOrdered: [] })] })],
      ["GET /order/disputes/all", () => reply(200, { disputes: [] })],
      ["GET /order/incidents", () => reply(404, { message: "Route not found" })],
    ]);
    renderAdmin();
    expect(await screen.findByText("Pending")).toBeInTheDocument();
    expect(screen.queryByText(/could not check for problems/i)).not.toBeInTheDocument();
  });
});
