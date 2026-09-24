import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UserContext from "../context/UserContext";
import AppLoginForm from "./AppLoginForm";
import { notyf, toastError } from "../utils/notify";
import { mockFetch, reply, offline } from "../testHelpers";

jest.mock("../utils/notify", () => ({
  notyf: { success: jest.fn(), error: jest.fn(), open: jest.fn() },
  toastError: jest.fn(),
}));

let setUser;

beforeEach(() => {
  localStorage.clear();
  setUser = jest.fn();
});

function fillAndSubmit() {
  render(
    <UserContext.Provider value={{ user: { id: null, isAdmin: null }, setUser }}>
      <MemoryRouter>
        <AppLoginForm />
      </MemoryRouter>
    </UserContext.Provider>
  );
  userEvent.type(screen.getByLabelText("Email:"), "ada@example.com");
  userEvent.type(screen.getByLabelText("Password"), "Secret123!");
  userEvent.click(screen.getByRole("button", { name: "Login" }));
}

test("a wrong password says so (it used to claim the email does not exist)", async () => {
  mockFetch([["POST /users/login", () => reply(401, { message: "Email and password do not match" })]]);
  fillAndSubmit();
  await waitFor(() => expect(notyf.error).toHaveBeenCalledWith("Incorrect email or password"));
  expect(localStorage.getItem("token")).toBeNull();
  expect(setUser).not.toHaveBeenCalled();
});

test("an unknown email gets the same message, so the form does not reveal who has an account", async () => {
  mockFetch([["POST /users/login", () => reply(404, { message: "No email found" })]]);
  fillAndSubmit();
  await waitFor(() => expect(notyf.error).toHaveBeenCalledWith("Incorrect email or password"));
});

test("when the server cannot be reached, it says that instead of failing silently", async () => {
  mockFetch([["POST /users/login", () => offline()]]);
  fillAndSubmit();
  await waitFor(() => expect(toastError).toHaveBeenCalled());
  expect(toastError.mock.calls[0][0].message).toMatch(/cannot reach the server/i);
  expect(notyf.error).not.toHaveBeenCalled();
});

test("logs in, stores the token, and never writes the token to the console", async () => {
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  mockFetch([
    ["POST /users/login", () => reply(200, { access: "secret-jwt-token" })],
    ["GET /users/details", () => reply(200, { _id: "u1", isAdmin: false })],
  ]);
  fillAndSubmit();

  await waitFor(() => expect(setUser).toHaveBeenCalledWith({ id: "u1", isAdmin: false }));
  expect(localStorage.getItem("token")).toBe("secret-jwt-token");
  expect(log).not.toHaveBeenCalled();
  log.mockRestore();
});

test("a token whose details cannot be fetched is not left behind as a half login", async () => {
  mockFetch([
    ["POST /users/login", () => reply(200, { access: "tok" })],
    ["GET /users/details", () => offline()],
  ]);
  fillAndSubmit();
  await waitFor(() => expect(toastError).toHaveBeenCalled());
  expect(localStorage.getItem("token")).toBeNull();
  expect(setUser).not.toHaveBeenCalled();
});
