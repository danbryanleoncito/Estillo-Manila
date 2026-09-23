import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import UserContext from "../context/UserContext";
import { useCart } from "../context/CartContext";
import { api } from "../utils/api";
import { notyf, toastError } from "../utils/notify";
import { MAX_QTY_PER_LINE, maxPurchasable, stockState } from "../utils/stock";

import { Container, Row, Col, Form, Button, FormControl, Badge } from "react-bootstrap";
import Card from "react-bootstrap/Card";

export default function ProductsView() {
  const { user } = useContext(UserContext);
  const { productId } = useParams();
  const { addToCart: addLineToCart, quantityInCart } = useCart();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | missing
  const [quantity, setQuantity] = useState("1"); // text, so the field can be typed into
  const [submitting, setSubmitting] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      const data = await api(`/product/${productId}`, { auth: false });
      setProduct(data);
      setStatus("ready");
    } catch (err) {
      setStatus("missing");
    }
  }, [productId]);

  // Load once per product (this used to refetch on every render).
  useEffect(() => {
    setStatus("loading");
    loadProduct();
  }, [loadProduct]);

  const stock = product ? product.stock : 0;
  const inCart = quantityInCart(productId);
  const archived = product && product.isActive === false;
  // What this customer can still add: live stock (capped at 99) minus what is already in the cart.
  const limit = product && !archived ? Math.max(0, maxPurchasable(stock) - inCart) : 0;
  const state = stockState(stock);

  const clampQty = useCallback(
    (value) => Math.max(1, Math.min(Math.floor(Number(value) || 1), Math.max(limit, 1))),
    [limit]
  );

  // If the limit drops (stock changed, or more went into the cart), pull the field back into range.
  useEffect(() => {
    setQuantity((q) => (limit > 0 && Number(q) > limit ? String(limit) : q));
  }, [limit]);

  async function addToCart(e) {
    e.preventDefault();
    if (limit === 0 || submitting) return;
    setSubmitting(true);
    try {
      await addLineToCart(productId, clampQty(quantity));
      notyf.success("Added To Cart Successfully!");
      setQuantity("1");
    } catch (err) {
      // e.g. 409 "Only 3 of X available": show the server's message and refresh the numbers
      // on screen so the limiter matches reality.
      toastError(err);
      if (err.status === 409) loadProduct();
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <Container className="my-5 py-5 text-center">
        <p className="text-muted">Loading product…</p>
      </Container>
    );
  }
  if (status === "missing" || !product) {
    return (
      <Container className="my-5 py-5 text-center">
        <h2 className="fw-bolder">Product not found</h2>
        <p>It may have been removed.</p>
        <Link to="/product">Back to all products</Link>
      </Container>
    );
  }

  const buttonLabel = archived
    ? "Unavailable"
    : state === "out"
    ? "Sold out"
    : limit === 0
    ? "Max in cart"
    : "Add To Cart";

  return (
    <Container className="my-5">
      <Row>
        <Col className="mb-4" md={4} lg={6}>
          <Card
            className={`card card-product rounded-0${state === "out" || archived ? " card-sold-out" : ""}`}
            style={{
              backgroundImage: `linear-gradient(to bottom, transparent, #000), url(${product.image})`,
            }}
          >
            <h4 className="fw-bold text-white bottom-0 position-absolute mx-3">
              ESTILO <span className="fs-6 ">MNL</span>
            </h4>
          </Card>
        </Col>
        <Col className="product-details mb-4 p-4 position-relative">
          <h1 className="fw-bolder">{product.name}</h1>
          <h2>&#x20B1;{product.price}</h2>
          <p>{product.description}</p>
          {archived && <Badge bg="secondary">No longer available</Badge>}
          {!archived && state === "out" && <Badge bg="dark">Sold out</Badge>}
          {!archived && state === "low" && (
            <Badge bg="warning" text="dark">
              Only {stock} left
            </Badge>
          )}
          {!archived && inCart > 0 && (
            <p className="text-muted mt-2 mb-0">You already have {inCart} in your cart.</p>
          )}
          {!archived && stock >= MAX_QTY_PER_LINE && (
            <p className="text-muted mt-2 mb-0">Maximum {MAX_QTY_PER_LINE} per order.</p>
          )}
          {user.id !== null ? (
            <Form onSubmit={addToCart}>
              <Form.Label className="position-absolute quantity-label">Quantity</Form.Label>
              <FormControl
                type="number"
                className="position-absolute quantity"
                value={quantity}
                min={1}
                max={Math.max(limit, 1)}
                disabled={limit === 0}
                aria-label="Quantity"
                onChange={(e) => setQuantity(e.target.value)}
                onBlur={() => setQuantity(String(clampQty(quantity)))}
              />
              <Button
                type="submit"
                className="btn btn-dark position-absolute add-to-cart"
                disabled={limit === 0 || submitting}
              >
                {buttonLabel}
              </Button>
            </Form>
          ) : (
            <>
              <p className="position-absolute bottom-0 mb-4">
                You need to login first to purchase this product.&nbsp;
                <Link to="/login">Click here</Link>
                &nbsp;to log in.
              </p>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}
