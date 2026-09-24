import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AppForm from "./AppForm";
import { notyf, toastError } from "../utils/notify";
import { mockFetch, reply, callsTo } from "../testHelpers";

jest.mock("../utils/notify", () => ({
  notyf: { success: jest.fn(), error: jest.fn(), open: jest.fn() },
  toastError: jest.fn(),
}));

const renderForm = () =>
  render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<AppForm />} />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>
  );

function fill({ password = "Secret123!", confirm = "Secret123!" } = {}) {
  userEvent.type(screen.getByLabelText("First name:"), "Ada");
  userEvent.type(screen.getByLabelText("Last name:"), "Lovelace");
  userEvent.type(screen.getByLabelText("Email:"), "ada@example.com");
  userEvent.type(screen.getByLabelText("Mobile Number:"), "09171234567");
  userEvent.type(screen.getByLabelText("Password"), password);
  userEvent.type(screen.getByLabelText("Verify Password:"), confirm);
  userEvent.click(screen.getByLabelText(/agree to terms/i));
  userEvent.click(screen.getByRole("button", { name: "Sign Up" }));
}

test("never writes the form (passwords included) to the console", async () => {
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  mockFetch([["POST /users/register", () => reply(201, { message: "User registered successfully" })]]);
  renderForm();
  fill();
  await screen.findByText("login page");
  expect(log).not.toHaveBeenCalled();
  log.mockRestore();
});

test("registers and sends the user to login", async () => {
  const fetchMock = mockFetch([
    ["POST /users/register", () => reply(201, { message: "User registered successfully" })],
  ]);
  renderForm();
  fill();
  expect(await screen.findByText("login page")).toBeInTheDocument();
  const body = JSON.parse(callsTo(fetchMock, "/users/register")[0][1].body);
  expect(body).toMatchObject({ firstName: "Ada", email: "ada@example.com", mobileNo: "09171234567" });
  expect(notyf.success).toHaveBeenCalled();
});

test("passwords that differ are caught before anything is sent", async () => {
  const fetchMock = mockFetch([]);
  renderForm();
  fill({ confirm: "Different123!" });
  await waitFor(() => expect(notyf.error).toHaveBeenCalledWith("The two passwords do not match"));
  expect(fetchMock).not.toHaveBeenCalled();
});

test("a server refusal (email already registered) is shown, and the form stays", async () => {
  mockFetch([["POST /users/register", () => reply(409, { message: "That email is already registered" })]]);
  renderForm();
  fill();
  await waitFor(() => expect(toastError).toHaveBeenCalled());
  expect(toastError.mock.calls[0][0].message).toBe("That email is already registered");
  expect(screen.queryByText("login page")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sign Up" })).toBeEnabled();
});
