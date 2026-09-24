// A failed request must never look like "nothing here": each page below used to turn an outage into
// "Product not found", "No products found" or an empty list. These tests drive real components with a
// stubbed fetch that answers 404, 500 or nothing at all.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UserContext from "../context/UserContext";
import ProductsView from "./ProductsView";
import Products from "./Products";
import ProductSearch from "./ProductSearch";
import { mockFetch, reply, offline } from "../testHelpers";

jest.mock("../utils/notify", () => ({
  notyf: { success: jest.fn(), error: jest.fn(), open: jest.fn() },
  toastError: jest.fn(),
}));
jest.mock("../context/CartContext", () => ({
  useCart: () => ({ addToCart: jest.fn(), quantityInCart: () => 0 }),
}));

const product = {
  _id: "p1",
  name: "Boxy Tee",
  description: "A tee",
  price: 899,
  image: "x.png",
  stock: 20,
  isActive: true,
};

const renderProductPage = () =>
  render(
    <UserContext.Provider value={{ user: { id: null, isAdmin: null } }}>
      <MemoryRouter initialEntries={["/product/p1"]}>
        <Routes>
          <Route path="/product/:productId" element={<ProductsView />} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>
  );

describe("product page", () => {
  test("a product the server says does not exist is 'not found'", async () => {
    mockFetch([["GET /product/p1", () => reply(404, { message: "Product not found" })]]);
    renderProductPage();
    expect(await screen.findByText("Product not found")).toBeInTheDocument();
  });

  test("a server error is a load failure with Retry, never 'Product not found'", async () => {
    mockFetch([["GET /product/p1", () => reply(500, { message: "Could not load" })]]);
    renderProductPage();
    expect(await screen.findByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByText("Product not found")).not.toBeInTheDocument();
  });

  test("an outage is a load failure too, and Retry recovers once the server is back", async () => {
    let up = false;
    mockFetch([["GET /product/p1", () => (up ? reply(200, product) : offline())]]);
    renderProductPage();

    expect(await screen.findByText(/cannot reach the server/i)).toBeInTheDocument();
    expect(screen.queryByText("Product not found")).not.toBeInTheDocument();

    up = true;
    userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Boxy Tee")).toBeInTheDocument();
  });
});

describe("home page featured products", () => {
  test("a failure is shown with Retry instead of an empty section", async () => {
    let up = false;
    mockFetch([["GET /product/active", () => (up ? reply(200, [product]) : offline())]]);
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );
    expect(await screen.findByText(/could not load the featured products/i)).toBeInTheDocument();

    up = true;
    userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Boxy Tee")).toBeInTheDocument();
    expect(screen.queryByText(/could not load/i)).not.toBeInTheDocument();
  });
});

describe("product search", () => {
  const renderSearch = () =>
    render(
      <MemoryRouter>
        <ProductSearch />
      </MemoryRouter>
    );

  test("a failed catalog load is an error, not an empty catalog", async () => {
    mockFetch([["GET /product/active", () => reply(500, { message: "x" })]]);
    renderSearch();
    expect(await screen.findByText(/could not load the products/i)).toBeInTheDocument();
  });

  test("a failed search says the search failed, never 'No products found'", async () => {
    let searchUp = false;
    mockFetch([
      ["GET /product/active", () => reply(200, [product])],
      [
        "POST /product/search-by-name",
        () => (searchUp ? reply(200, [product]) : reply(500, { message: "x" })),
      ],
    ]);
    renderSearch();
    await screen.findByText("Boxy Tee");

    userEvent.type(screen.getByPlaceholderText("Search"), "tee");
    expect(await screen.findByText("The search failed.")).toBeInTheDocument();
    expect(screen.queryByText("No products found.")).not.toBeInTheDocument();

    searchUp = true;
    userEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.queryByText("The search failed.")).not.toBeInTheDocument());
    expect(screen.getByText("Boxy Tee")).toBeInTheDocument();
  });

  test("a search with genuinely no matches (404) still says so", async () => {
    mockFetch([
      ["GET /product/active", () => reply(200, [product])],
      ["POST /product/search-by-name", () => reply(404, { message: "No products found" })],
    ]);
    renderSearch();
    await screen.findByText("Boxy Tee");
    userEvent.type(screen.getByPlaceholderText("Search"), "zzz");
    expect(await screen.findByText("No products found.")).toBeInTheDocument();
  });
});
