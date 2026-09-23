import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuantitySelector from "./QuantitySelector";
import { useCart } from "../context/CartContext";

jest.mock("../context/CartContext", () => ({ useCart: jest.fn() }));

let setQuantity;
let refreshCart;

// CRA resets mocks before each test, so the mock cart is installed per test.
beforeEach(() => {
  setQuantity = jest.fn().mockResolvedValue({});
  refreshCart = jest.fn().mockResolvedValue({});
  useCart.mockReturnValue({ setQuantity, refreshCart });
});

const renderSelector = (props) =>
  render(<QuantitySelector productId="p1" quantity={2} stock={5} {...props} />);

test("plus and minus change the quantity by one", async () => {
  renderSelector();
  userEvent.click(screen.getByLabelText("Increase quantity"));
  await waitFor(() => expect(setQuantity).toHaveBeenCalledWith("p1", 3));
});

test("plus is disabled at the stock limit and minus at 1", () => {
  const { rerender } = renderSelector({ quantity: 5, stock: 5 });
  expect(screen.getByLabelText("Increase quantity")).toBeDisabled();
  rerender(<QuantitySelector productId="p1" quantity={1} stock={5} />);
  expect(screen.getByLabelText("Decrease quantity")).toBeDisabled();
});

test("the limit is capped at 99 even with more stock", () => {
  renderSelector({ quantity: 99, stock: 500 });
  expect(screen.getByLabelText("Increase quantity")).toBeDisabled();
  expect(screen.getByLabelText("Quantity")).toHaveAttribute("max", "99");
});

test("typing more than the stock is clamped to the stock", async () => {
  renderSelector({ quantity: 2, stock: 5 });
  const input = screen.getByLabelText("Quantity");
  userEvent.clear(input);
  userEvent.type(input, "50");
  userEvent.tab();
  await waitFor(() => expect(setQuantity).toHaveBeenCalledWith("p1", 5));
});

test("when stock fell below the cart quantity it allows reducing but not increasing", () => {
  renderSelector({ quantity: 4, stock: 0 });
  expect(screen.getByLabelText("Increase quantity")).toBeDisabled();
  expect(screen.getByLabelText("Decrease quantity")).toBeEnabled();
});

test("a refused change snaps back to the server's quantity and refreshes the cart", async () => {
  setQuantity.mockRejectedValue(new Error("Only 3 of Tee available"));
  renderSelector({ quantity: 2, stock: 5 });
  userEvent.click(screen.getByLabelText("Increase quantity"));
  await waitFor(() => expect(refreshCart).toHaveBeenCalled());
  await waitFor(() => expect(screen.getByLabelText("Quantity")).toHaveValue(2));
});
