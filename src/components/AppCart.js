import Table from "react-bootstrap/Table";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Badge, Button, Container, Row, Col } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import QuantitySelector from "./QuantitySelector";
import { notyf, toastError } from "../utils/notify";
import { useCart } from "../context/CartContext";
import { getLineIssue, getLowStockNote } from "../utils/cartIssues";
import LoadError from "./LoadError";

export default function AppCart() {
  const navigate = useNavigate();
  // The cart lives in CartContext (fetched once, refreshed after every change).
  const {
    lines,
    loaded,
    error,
    retry,
    missingCount,
    totalPrice,
    clearCart,
    removeItem,
    setQuantity,
  } = useCart();

  const issues = lines.map((line) => getLineIssue(line));
  const problemCount = issues.filter(Boolean).length + missingCount;
  // A cart that failed to load is not an empty cart.
  const loadFailed = loaded && error && lines.length === 0 && missingCount === 0;
  const isEmpty = loaded && !error && lines.length === 0 && missingCount === 0;

  function goToCheckout() {
    if (problemCount > 0) {
      notyf.error("Fix the items marked below before checking out");
      return;
    }
    navigate("/checkout");
  }

  async function handleClear() {
    try {
      await clearCart();
      notyf.success("Cleared cart successfully!");
    } catch (err) {
      toastError(err);
    }
  }

  async function handleRemove(productId) {
    try {
      await removeItem(productId);
      notyf.success("Deleted item successfully!");
    } catch (err) {
      toastError(err);
    }
  }

  async function reduceTo(productId, quantity) {
    try {
      await setQuantity(productId, quantity);
    } catch (err) {
      toastError(err);
    }
  }

  return (
    <Container>
      <Row>
        <Col>
          <h1 className="mt-5 fw-bolder">Shopping Cart</h1>
        </Col>
      </Row>

      {!loaded && <p className="text-muted mt-5">Loading your cart…</p>}

      {loadFailed && <LoadError message="We could not load your cart." onRetry={retry} />}
      {loaded && error && !loadFailed && (
        <LoadError
          message="We could not refresh your cart, so what you see may be out of date."
          onRetry={retry}
        />
      )}

      {isEmpty && (
        <Container className="my-5 text-center py-5">
          <h3 className="fw-bolder">Your cart is empty</h3>
          <Link to="/product">Browse products</Link>
        </Container>
      )}

      {loaded && !isEmpty && !loadFailed && (
        <>
          {missingCount > 0 && (
            <Alert variant="warning" className="mt-4">
              {missingCount === 1
                ? "An item in your cart is no longer available."
                : `${missingCount} items in your cart are no longer available.`}{" "}
              Clear the cart to continue.
            </Alert>
          )}
          {problemCount - missingCount > 0 && (
            <Alert variant="warning" className="mt-4">
              Some items are sold out or have limited stock. Fix or remove the items marked below
              to check out.
            </Alert>
          )}
          <Row>
            <Table className="container mt-4 align-middle">
              <thead>
                <tr>
                  <th colSpan={2}>Item</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((crt, i) => {
                  const product = crt.productId;
                  const issue = issues[i];
                  const lowNote = getLowStockNote(crt);
                  return (
                    <tr key={product._id}>
                      <td style={{ width: 150 }}>
                        <Image src={product.image} width={130} height={130} roundedCircle />
                      </td>
                      <td>
                        <strong>{product.name}</strong>
                        <p className="cart-description mb-1">{product.description}</p>
                        {issue && (
                          <div className="mb-2">
                            <Badge
                              bg={issue.type === "over" ? "warning" : "danger"}
                              text={issue.type === "over" ? "dark" : undefined}
                            >
                              {issue.message}
                            </Badge>{" "}
                            {issue.type === "over" && (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 align-baseline"
                                onClick={() => reduceTo(product._id, issue.fixTo)}
                              >
                                Reduce to {issue.fixTo}
                              </Button>
                            )}
                            {issue.type !== "over" && (
                              <span className="text-muted small">Remove it to continue.</span>
                            )}
                          </div>
                        )}
                        {!issue && lowNote && (
                          <Badge bg="warning" text="dark" className="mb-2">
                            {lowNote}
                          </Badge>
                        )}
                        <div className="mt-2">
                          <span>Quantity:</span>
                          <QuantitySelector
                            quantity={crt.quantity}
                            stock={product.stock}
                            productId={product._id}
                          />
                        </div>
                      </td>
                      <td className="cart-price">&#x20B1;{product.price}</td>
                      <td className="cart-subtotal">&#x20B1;{crt.subtotal}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemove(product._id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>
                    <h3 className="fw-bolder">TOTAL: &#x20B1;{totalPrice}</h3>
                  </td>
                  <td>
                    <Button variant="outline-danger" className="m-2" onClick={handleClear}>
                      Clear
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-dark"
                      disabled={problemCount > 0}
                      onClick={goToCheckout}
                    >
                      Checkout
                    </Button>
                  </td>
                </tr>
              </tfoot>
            </Table>
          </Row>
        </>
      )}
    </Container>
  );
}
