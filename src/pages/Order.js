import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Container, Alert, ListGroup, Badge } from "react-bootstrap";
import { notyf, toastError } from "../utils/notify";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import AppCheckoutForm from "../components/AppCheckoutForm";
import AppPaymentMethod from "../components/AppPaymentMethod";
import { api, isStockConflict } from "../utils/api";
import { useCart } from "../context/CartContext";
import { getLineIssue } from "../utils/cartIssues";
import LoadError from "../components/LoadError";

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Created inside the component (not at module scope) so App.test.js's smoke
  // test, which never navigates here, never triggers loadStripe(undefined).
  const stripePromise = useMemo(
    () => loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY),
    []
  );

  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormInner paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
    </Elements>
  );
}

function CheckoutFormInner({ paymentMethod, setPaymentMethod }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { lines, loaded, error: cartError, missingCount, totalPrice, retry } = useCart();

  const [submitting, setSubmitting] = useState(false);
  // Items the server (or our own pre-check) says are not available: [{ name, requested, available }].
  const [conflict, setConflict] = useState(null);
  // Set once the card has been charged. From then on a retry only finishes the order; it must
  // never create a second PaymentIntent (that would charge the customer twice).
  const [paidIntentId, setPaidIntentId] = useState(null);
  const [failure, setFailure] = useState(null);

  // A cart that failed to load is not an empty cart, and cannot be checked out either.
  const isEmpty = loaded && !cartError && lines.length === 0 && missingCount === 0;
  const issues = lines.map((line) => getLineIssue(line));
  const problemCount = issues.filter(Boolean).length + missingCount;
  const blocked = (problemCount > 0 || Boolean(cartError)) && !paidIntentId;

  const localConflict = () =>
    lines
      .map((line, i) =>
        issues[i]
          ? {
              name: line.productId.name,
              requested: line.quantity,
              available: issues[i].type === "over" ? issues[i].fixTo : 0,
            }
          : null
      )
      .filter(Boolean);

  async function finishOrder(result) {
    setPaidIntentId(null);
    setFailure(null);
    setConflict(null);
    await retry(); // the order is placed either way; a refresh failure shows on the next page
    if (result && result.disputesOpened > 0) {
      // Some lines were only partly available; the customer has to decide on the Profile page.
      navigate("/profile", { state: { notice: { variant: "warning", text: result.message } } });
    } else {
      notyf.success("Order placed successfully!");
      navigate("/profile");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (isEmpty) {
      notyf.error("Your cart is empty");
      return;
    }
    if (blocked && cartError) {
      notyf.error("We could not load your cart. Please retry.");
      return;
    }
    if (blocked) {
      setConflict(localConflict());
      notyf.error("Some items in your cart are not available");
      return;
    }

    setSubmitting(true);
    setConflict(null);
    // Local copy: state read inside this handler is the value from when it started, so a charge
    // made during this very attempt would not be visible in `paidIntentId` when the catch runs.
    let chargedId = paidIntentId;
    try {
      let result;
      if (paymentMethod === "cod") {
        result = await api("/order/checkout", { method: "POST", body: {} });
      } else {
        let intentId = paidIntentId;
        if (!intentId) {
          if (!stripe || !elements) {
            throw new Error("Payment form is still loading, please try again");
          }
          const pi = await api("/payment/create-payment-intent", { method: "POST" });
          const confirmation = await stripe.confirmCardPayment(pi.clientSecret, {
            payment_method: { card: elements.getElement(CardElement) },
          });
          if (confirmation.error) {
            throw new Error(confirmation.error.message || "Payment failed");
          }
          if (confirmation.paymentIntent.status !== "succeeded") {
            throw new Error("Payment was not completed");
          }
          intentId = pi.paymentIntentId;
          chargedId = intentId;
          setPaidIntentId(intentId);
        }
        result = await api("/order/checkout", {
          method: "POST",
          body: { paymentIntentId: intentId },
        });
      }
      await finishOrder(result);
    } catch (err) {
      if (isStockConflict(err)) {
        // Sold out (before charging, or the charge was refunded). Show exactly what and refresh
        // the cart so the numbers on screen are current.
        setConflict(err.data.outOfStock);
        if (chargedId || /refunded/i.test(err.message)) setPaidIntentId(null);
        setFailure(null);
        retry();
        notyf.error(err.message);
      } else if (chargedId) {
        // Charged, but the order could not be finished: keep the intent so a retry only finishes it.
        setFailure(err.message);
        toastError(err);
      } else {
        toastError(err);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        {loaded && cartError && (
          <LoadError message="We could not load your cart, so we cannot check it out yet." onRetry={retry} />
        )}

        {isEmpty && (
          <Alert variant="warning" className="mt-4">
            Your cart is empty. <Link to="/cart">Go back to your cart</Link>.
          </Alert>
        )}

        {conflict && conflict.length > 0 && (
          <Alert variant="danger" className="mt-4">
            <Alert.Heading as="h5">Some items are no longer available</Alert.Heading>
            <ul className="mb-2">
              {conflict.map((item, i) => (
                <li key={item.productId || i}>
                  <strong>{item.name || "An item"}</strong>:{" "}
                  {item.available > 0
                    ? `you asked for ${item.requested}, only ${item.available} available`
                    : "sold out"}
                </li>
              ))}
            </ul>
            <Link to="/cart">Review your cart</Link>
          </Alert>
        )}

        {paidIntentId && (
          <Alert variant="info" className="mt-4">
            <strong>Your payment went through</strong>, but we could not finish your order
            {failure ? ` (${failure})` : ""}. Press <em>Finish my order</em> to try again. You will
            not be charged twice. Reference: <code>{paidIntentId}</code>
          </Alert>
        )}

        {!isEmpty && lines.length > 0 && (
          <div className="mt-4">
            <h4>Order summary</h4>
            <ListGroup variant="flush">
              {lines.map((line, i) => (
                <ListGroup.Item
                  key={line.productId._id}
                  className="d-flex justify-content-between align-items-center px-0"
                >
                  <span>
                    {line.productId.name} × {line.quantity}{" "}
                    {issues[i] && (
                      <Badge bg={issues[i].type === "over" ? "warning" : "danger"} text={issues[i].type === "over" ? "dark" : undefined}>
                        {issues[i].message}
                      </Badge>
                    )}
                  </span>
                  <span>&#x20B1;{line.subtotal}</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
            {blocked && (
              <p className="mt-2 mb-0">
                <Link to="/cart">Fix these items in your cart</Link> to continue.
              </p>
            )}
          </div>
        )}

        <AppCheckoutForm />
        <AppPaymentMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
        <div className="d-flex justify-content-end mb-5">
          <Button type="submit" variant="primary" disabled={submitting || isEmpty || blocked}>
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Processing…
              </>
            ) : paidIntentId ? (
              "Finish my order"
            ) : (
              `Complete order — ₱${totalPrice}`
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
}
