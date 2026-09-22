import { render, screen } from "@testing-library/react";
import App from "./App";

// CRA's jest config sets resetMocks: true, so the stub has to be installed per test.
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([]) })
  );
});

test("renders the navbar logo and featured products heading", async () => {
  render(<App />);

  expect(screen.getByAltText("logo-image")).toBeInTheDocument();
  expect(await screen.findByText(/featured products/i)).toBeInTheDocument();
});
