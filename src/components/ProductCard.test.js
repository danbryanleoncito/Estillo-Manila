import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "./ProductCard";

const renderCard = (overrides) =>
  render(
    <MemoryRouter>
      <ProductCard
        product={{ _id: "p1", name: "Boxy Tee", price: 799, image: "x.png", stock: 20, ...overrides }}
      />
    </MemoryRouter>
  );

test("a product with plenty of stock has no badge", () => {
  renderCard({ stock: 20 });
  expect(screen.getByText("Boxy Tee")).toBeInTheDocument();
  expect(screen.queryByText(/sold out/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/left/i)).not.toBeInTheDocument();
});

test("5 or fewer shows an 'Only N left' badge", () => {
  renderCard({ stock: 3 });
  expect(screen.getByText("Only 3 left")).toBeInTheDocument();
});

test("0 stock shows a Sold out badge and dims the card, but stays a link", () => {
  const { container } = renderCard({ stock: 0 });
  expect(screen.getByText("Sold out")).toBeInTheDocument();
  expect(container.querySelector(".card-sold-out")).not.toBeNull();
  expect(screen.getByRole("link")).toHaveAttribute("href", "/product/p1");
});

test("a product with no stock field (not yet backfilled) counts as sold out", () => {
  renderCard({ stock: undefined });
  expect(screen.getByText("Sold out")).toBeInTheDocument();
});

test("there is exactly one anchor (no nested links)", () => {
  renderCard({});
  expect(screen.getAllByRole("link")).toHaveLength(1);
});
