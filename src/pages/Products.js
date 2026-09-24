import { Container, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { api } from "../utils/api";
import { stockState } from "../utils/stock";

const FEATURED_COUNT = 3;

// Random pick, preferring products that can actually be bought (falls back to everything
// when fewer than three are in stock).
export function pickFeatured(products, count = FEATURED_COUNT, random = Math.random) {
  const active = products.filter((p) => p.isActive !== false);
  const inStock = active.filter((p) => stockState(p.stock) !== "out");
  const pool = inStock.length >= count ? inStock : active;
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api("/product/active", { auth: false, emptyOn404: [] })
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data) ? pickFeatured(data) : []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container className="my-5">
      <Row className="mb-2">
        <h1 className="fw-bolder">Featured Products</h1>
      </Row>
      <Row>
        {products.map((product) => (
          <Col key={product._id}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
