import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UserContext from "../context/UserContext";
import RequireAuth, { RequireAdmin } from "./RequireAuth";

const renderAt = (ctx, element) =>
  render(
    <UserContext.Provider value={ctx}>
      <MemoryRouter initialEntries={["/secret"]}>
        <Routes>
          <Route path="/secret" element={element} />
          <Route path="/login" element={<div>login page</div>} />
          <Route path="/" element={<div>home page</div>} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>
  );

test("shows a spinner, and does not redirect, until the login has been restored", () => {
  renderAt(
    { user: { id: null, isAdmin: null }, authReady: false },
    <RequireAuth>
      <div>secret</div>
    </RequireAuth>
  );
  expect(screen.getByRole("status")).toBeInTheDocument();
  expect(screen.queryByText("login page")).not.toBeInTheDocument();
});

test("sends a logged-out visitor to /login once auth is ready", () => {
  renderAt(
    { user: { id: null, isAdmin: null }, authReady: true },
    <RequireAuth>
      <div>secret</div>
    </RequireAuth>
  );
  expect(screen.getByText("login page")).toBeInTheDocument();
});

test("renders the page for a logged-in user", () => {
  renderAt(
    { user: { id: "u1", isAdmin: false }, authReady: true },
    <RequireAuth>
      <div>secret</div>
    </RequireAuth>
  );
  expect(screen.getByText("secret")).toBeInTheDocument();
});

test("admin routes send a non-admin home, and let an admin in", () => {
  const { unmount } = renderAt(
    { user: { id: "u1", isAdmin: false }, authReady: true },
    <RequireAdmin>
      <div>admin only</div>
    </RequireAdmin>
  );
  expect(screen.getByText("home page")).toBeInTheDocument();
  unmount();

  renderAt(
    { user: { id: "a1", isAdmin: true }, authReady: true },
    <RequireAdmin>
      <div>admin only</div>
    </RequireAdmin>
  );
  expect(screen.getByText("admin only")).toBeInTheDocument();
});

test("when the saved login could not be checked (server unreachable) it offers Retry instead of redirecting", () => {
  const retryAuth = jest.fn();
  renderAt(
    { user: { id: null, isAdmin: null }, authReady: true, authError: "offline", retryAuth },
    <RequireAuth>
      <div>secret</div>
    </RequireAuth>
  );
  expect(screen.queryByText("login page")).not.toBeInTheDocument();
  expect(screen.getByText(/cannot reach the server/i)).toBeInTheDocument();
  screen.getByRole("button", { name: "Retry" }).click();
  expect(retryAuth).toHaveBeenCalled();
});
