// The checkout page end to end (with a stubbed server and a stubbed Stripe): what is sent, in what
// order, and that an incomplete address never gets that far.
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Checkout from "./Order";
import { useCart } from "../context/CartContext";
import { mockFetch, reply, callsTo } from "../testHelpers";

jest.mock("../utils/notify", () => ({
  notyf: { success: jest.fn(), error: jest.fn(), open: jest.fn() },
  toastError: jest.fn(),
}));
jest.mock("../context/CartContext", () => ({ useCart: jest.fn() }));

const mockConfirm = jest.fn();
jest.mock("@stripe/stripe-js", () => ({ loadStripe: jest.fn(() => Promise.resolve(null)) }));
jest.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }) => children,
  CardElement: () => <div data-testid="card-element" />,
  useStripe: () => ({ confirmCardPayment: mockConfirm }),
  useElements: () => ({ getElement: () => ({}) }),
}));

const line = {
  productId: { _id: "p1", name: "Boxy Tee", price: 899, stock: 20, isActive: true },
  quantity: 1,
  subtotal: 899,
};

beforeEach(() => {
  useCart.mockReturnValue({
    lines: [line],
    loaded: true,
    error: null,
    retry: jest.fn().mockResolvedValue(null),
    missingCount: 0,
    totalPrice: 899,
  });
  mockConfirm.mockResolvedValue({ paymentIntent: { status: "succeeded" } });
});

const renderCheckout = () =>
  render(
    <MemoryRouter initialEntries={["/checkout"]}>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<div>profile page</div>} />
      </Routes>
    </MemoryRouter>
  );

function fillAddress(over = {}) {
  const v = {
    "Full name": "Ada Lovelace",
    "Mobile number": "0917 123 4567",
    "Street address": "12 Rizal Street",
    "City / municipality": "Makati",
    "Province / region": "Metro Manila",
    "Postal code": "1200",
    ...over,
  };
  for (const [label, value] of Object.entries(v)) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
}

const submit = () => userEvent.click(screen.getByRole("button", { name: /complete order/i }));
const bodyOf = (fetchMock, fragment, n = 0) => JSON.parse(callsTo(fetchMock, fragment)[n][1].body);

const address = {
  fullName: "Ada Lovelace",
  phone: "0917 123 4567",
  addressLine1: "12 Rizal Street",
  addressLine2: "",
  city: "Makati",
  province: "Metro Manila",
  postalCode: "1200",
  country: "Philippines",
};

test("Cash on Delivery sends the address with the order", async () => {
  const fetchMock = mockFetch([["POST /order/checkout", () => reply(200, { message: "Ordered successfully", order: {} })]]);
  renderCheckout();
  userEvent.click(screen.getByLabelText(/cash on delivery/i));
  fillAddress();
  submit();

  await screen.findByText("profile page");
  expect(bodyOf(fetchMock, "/order/checkout")).toEqual({ shippingAddress: address });
});

test("card payment sends the address when the payment is created, and only the payment reference at checkout", async () => {
  const fetchMock = mockFetch([
    ["POST /payment/create-payment-intent", () => reply(201, { clientSecret: "cs", paymentIntentId: "pi_1" })],
    ["POST /order/checkout", () => reply(200, { message: "Ordered successfully", order: {} })],
  ]);
  renderCheckout();
  fillAddress({ "Street address": "99 Ayala Avenue" });
  submit();

  await screen.findByText("profile page");
  expect(bodyOf(fetchMock, "/payment/create-payment-intent").shippingAddress).toEqual({
    ...address,
    addressLine1: "99 Ayala Avenue",
  });
  expect(bodyOf(fetchMock, "/order/checkout")).toEqual({ paymentIntentId: "pi_1" });
  expect(mockConfirm).toHaveBeenCalledTimes(1);
});

// jsdom does not block a submit on invalid fields the way a browser does, so this checks the thing the
// browser acts on: which fields are invalid. (Blocking itself, and the minimum lengths, which jsdom
// only applies to user-edited values, are checked in a real browser and by the server's own tests.)
test("each bad value makes its field invalid, and each good value makes it valid", () => {
  renderCheckout();
  userEvent.click(screen.getByLabelText(/cash on delivery/i));

  const cases = [
    ["Full name", "", "Ada Lovelace"],
    ["Mobile number", "12345", "0917 123 4567"],
    ["Mobile number", "08171234567", "+639171234567"],
    ["Mobile number", "555", "+63 917 123 4567"],
    ["Mobile number", "63 917 123 4567", "0917-123-4567"],
    ["Street address", "", "12 Rizal Street"],
    ["City / municipality", "", "Makati"],
    ["Province / region", "", "Metro Manila"],
    ["Postal code", "12", "1200"],
    ["Postal code", "12345", "1200"],
    ["Postal code", "12ab", "1200"],
  ];
  for (const [label, bad, good] of cases) {
    const input = screen.getByLabelText(label);
    fireEvent.change(input, { target: { value: bad } });
    expect(input).toBeInvalid();
    fireEvent.change(input, { target: { value: good } });
    expect(input).toBeValid();
  }
});

test("the second address line is optional", () => {
  renderCheckout();
  expect(screen.getByLabelText(/apartment, unit, building/i)).toBeValid();
  expect(screen.getByLabelText(/apartment, unit, building/i)).not.toBeRequired();
});

test("the country is fixed to the Philippines", () => {
  renderCheckout();
  expect(screen.getByLabelText("Country")).toHaveValue("Philippines");
  expect(screen.getByLabelText("Country")).toBeDisabled();
});

test("the server's complaint about the address is shown and the customer can fix it and retry", async () => {
  const { toastError } = require("../utils/notify");
  let attempt = 0;
  mockFetch([
    [
      "POST /order/checkout",
      () =>
        ++attempt === 1
          ? reply(400, { message: "Enter the 4-digit postal code", field: "postalCode" })
          : reply(200, { message: "Ordered successfully", order: {} }),
    ],
  ]);
  renderCheckout();
  userEvent.click(screen.getByLabelText(/cash on delivery/i));
  fillAddress();
  submit();

  await waitFor(() => expect(toastError).toHaveBeenCalled());
  expect(toastError.mock.calls[0][0].message).toBe("Enter the 4-digit postal code");
  expect(screen.queryByText("profile page")).not.toBeInTheDocument();

  // The button is busy ("Processing…") until the failed attempt has finished; then retry.
  userEvent.click(await screen.findByRole("button", { name: /complete order/i }));
  await screen.findByText("profile page");
});

test("once the card has been charged the address is locked, and a retry sends no new payment", async () => {
  let checkoutAttempt = 0;
  const fetchMock = mockFetch([
    ["POST /payment/create-payment-intent", () => reply(201, { clientSecret: "cs", paymentIntentId: "pi_1" })],
    [
      "POST /order/checkout",
      () =>
        ++checkoutAttempt === 1
          ? reply(500, { message: "Checkout failed. Please try again." })
          : reply(200, { message: "Ordered successfully", order: {} }),
    ],
  ]);
  renderCheckout();
  fillAddress();
  submit();

  expect(await screen.findByText(/your payment went through/i)).toBeInTheDocument();
  expect(screen.getByLabelText("Street address")).toBeDisabled();

  userEvent.click(screen.getByRole("button", { name: /finish my order/i }));
  await screen.findByText("profile page");
  expect(callsTo(fetchMock, "/payment/create-payment-intent")).toHaveLength(1);
  expect(mockConfirm).toHaveBeenCalledTimes(1);
});
