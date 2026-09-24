import { Col, Row, Container } from "react-bootstrap";
import { Form, FormControl } from "react-bootstrap";
import ProductCard from "../components/ProductCard";
import { useCallback, useEffect, useState } from "react";
import { api } from "../utils/api";
import LoadError from "../components/LoadError";

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  // null = not searching (show the full catalog); an array (possibly empty) = search results.
  const [results, setResults] = useState(null);
  // A failed load or search is shown as a failure, never as "No products found".
  const [loadError, setLoadError] = useState(null);
  const [searchError, setSearchError] = useState(null);
  // Bumped by Retry so the search effect runs again for the same text.
  const [searchAttempt, setSearchAttempt] = useState(0);

  // Load the catalog once. This used to have no dependency array and looped forever.
  const loadCatalog = useCallback((isCancelled = () => false) => {
    setLoadError(null);
    return api("/product/active", { auth: false, emptyOn404: [] })
      .then((data) => {
        if (!isCancelled()) setProducts(Array.isArray(data) ? data.filter((p) => p.isActive !== false) : []);
      })
      .catch((err) => !isCancelled() && setLoadError(err.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadCatalog(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [loadCatalog]);

  // Search as the user types, but wait 300 ms after the last keystroke and ignore stale
  // responses (it used to fire a request per key press, including Shift and arrows).
  useEffect(() => {
    const term = search.trim();
    setSearchError(null);
    if (!term) {
      setResults(null);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const data = await api("/product/search-by-name", {
          method: "POST",
          auth: false,
          // The server treats the term as a regex, so escape it (an unbalanced "(" would error).
          body: { name: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") },
          emptyOn404: [],
        });
        if (!cancelled) setResults(Array.isArray(data) ? data.filter((p) => p.isActive !== false) : []);
      } catch (err) {
        if (!cancelled) {
          setResults(null);
          setSearchError(err.message);
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, searchAttempt]);

  const sortProducts = [...products].sort(
    (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
  );
  const shown = searchError ? [] : results !== null ? results : sortProducts;

  return (
    <Container className="my-5">
      <Row className="mt-5 mb-3">
        <Col>
          <h1 className="fw-bolder">Products</h1>
          <Form onSubmit={(e) => e.preventDefault()}>
            <FormControl
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Form>
        </Col>
      </Row>
      {loadError && (
        <LoadError message="We could not load the products." onRetry={() => loadCatalog()} />
      )}
      {searchError && (
        <LoadError
          message="The search failed."
          onRetry={() => setSearchAttempt((n) => n + 1)}
        />
      )}
      <Row className="d-flex">
        {results !== null && results.length === 0 && (
          <Col>
            <p className="text-muted mt-4">No products found.</p>
          </Col>
        )}
        {shown.map((product) => (
          <Col className="px-0 mx-auto flex-fill" md={4} key={product._id}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
