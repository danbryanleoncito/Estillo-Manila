import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DisputeResolveModal from "./DisputeResolveModal";

const dispute = {
  _id: "d1",
  productName: "Cargo Pants",
  requestedQuantity: 5,
  reservedQuantity: 3,
  unitPrice: 100,
  expiresAt: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
};

function reply(status, body) {
  return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
}

function setup(props = {}) {
  const onDone = jest.fn().mockResolvedValue();
  const onHide = jest.fn();
  render(<DisputeResolveModal dispute={dispute} show onHide={onHide} onDone={onDone} {...props} />);
  return { onDone, onHide };
}

beforeEach(() => {
  global.fetch = jest.fn();
});

test("defaults to keeping everything held and previews the refund for the rest", () => {
  setup();
  expect(screen.getByLabelText(/how many do you want to keep/i)).toHaveValue(3);
  expect(screen.getByText(/refunded/i)).toHaveTextContent("₱200");
});

test("the preview follows the number to keep", async () => {
  setup();
  const input = screen.getByLabelText(/how many do you want to keep/i);
  await userEvent.clear(input);
  await userEvent.type(input, "1");
  expect(screen.getByText(/refunded/i)).toHaveTextContent("₱400");
});

test("an out-of-range quantity disables Confirm and is never sent", async () => {
  setup();
  const input = screen.getByLabelText(/how many do you want to keep/i);
  await userEvent.clear(input);
  await userEvent.type(input, "4");
  expect(screen.getByRole("button", { name: /confirm/i })).toBeDisabled();
  expect(global.fetch).not.toHaveBeenCalled();
});

test("cancelling shows the full line refund and posts the cancel action", async () => {
  global.fetch.mockReturnValue(reply(200, { dispute: {} }));
  const { onDone, onHide } = setup();
  await userEvent.click(screen.getByLabelText(/cancel this item/i));
  expect(screen.getByText(/refunded/i)).toHaveTextContent("₱500");
  await userEvent.click(screen.getByRole("button", { name: /cancel item/i }));
  await waitFor(() => expect(onHide).toHaveBeenCalled());
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/order\/disputes\/d1\/resolve$/);
  expect(JSON.parse(options.body)).toEqual({ action: "cancel" });
  expect(onDone).toHaveBeenCalled();
});

test("keeping fewer posts the reduce action with the quantity", async () => {
  global.fetch.mockReturnValue(reply(200, { dispute: {} }));
  const { onHide } = setup();
  const input = screen.getByLabelText(/how many do you want to keep/i);
  await userEvent.clear(input);
  await userEvent.type(input, "2");
  await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
  await waitFor(() => expect(onHide).toHaveBeenCalled());
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ action: "reduce", quantity: 2 });
});

test("an already-resolved dispute (409) refreshes and closes instead of erroring", async () => {
  global.fetch.mockReturnValue(reply(409, { message: "Dispute already resolved" }));
  const { onDone, onHide } = setup();
  await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
  await waitFor(() => expect(onHide).toHaveBeenCalled());
  expect(onDone).toHaveBeenCalled();
});

test("a server-side 400 stays open and shows the message", async () => {
  global.fetch.mockReturnValue(reply(400, { message: "Quantity must be between 1 and 3" }));
  const { onHide } = setup();
  await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
  expect(await screen.findByText(/must be between 1 and 3/i)).toBeInTheDocument();
  expect(onHide).not.toHaveBeenCalled();
});
