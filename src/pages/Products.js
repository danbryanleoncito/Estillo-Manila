import { Container, Row, Col } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import ProductCard from "../components/ProductCard";
import { api } from "../utils/api";
import { stockState } from "../utils/stock";
import LoadError from "../components/LoadError";

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
  const [error, setError] = useState(null);

  const load = useCallback((isCancelled = () => false) => {
    setError(null);
    return api("/product/active", { auth: false, emptyOn404: [] })
      .then((data) => {
        if (!isCancelled()) setProducts(Array.isArray(data) ? pickFeatured(data) : []);
      })
      .catch((err) => {
        // An empty list would read as "no products", which is not what happened.
        if (!isCancelled()) setError(err.message);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    load(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [load]);

  return (
    <Container className="my-5">
      <Row className="mb-2">
        <h1 className="fw-bolder">Featured Products</h1>
      </Row>
      {error && (
        <LoadError message="We could not load the featured products." onRetry={() => load()} />
      )}
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
