import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Container, Alert } from "react-bootstrap";
import { notyf } from "../utils/notify";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import AppCheckoutForm from "../components/AppCheckoutForm";
import AppPaymentMethod from "../components/AppPaymentMethod";

const API = process.env.REACT_APP_API_BASE_URL;

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [submitting, setSubmitting] = useState(false);

  // Created inside the component (not at module scope) so App.test.js's smoke
  // test, which never navigates here, never triggers loadStripe(undefined).
  const stripePromise = useMemo(
    () => loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY),
    []
  );

  useEffect(() => {
    fetch(`${API}/cart/get-cart`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCart(data.cartItems || []);
        setCartTotal(data.totalPrice || 0);
        setCartLoaded(true);
      })
      .catch(() => setCartLoaded(true));
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormInner
        cart={cart}
        cartTotal={cartTotal}
        cartLoaded={cartLoaded}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        submitting={submitting}
        setSubmitting={setSubmitting}
      />
    </Elements>
  );
}

function CheckoutFormInner({
  cart,
  cartTotal,
  cartLoaded,
  paymentMethod,
  setPaymentMethod,
  submitting,
  setSubmitting,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const isEmpty = cartLoaded && (!cart || cart.length === 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!cart || cart.length === 0) {
      notyf.error("Your cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      if (paymentMethod === "cod") {
        await postJson(`${API}/order/checkout`, {});
      } else {
        if (!stripe || !elements) {
          throw new Error("Payment form is still loading, please try again");
        }
        const pi = await postJson(`${API}/payment/create-payment-intent`, undefined);
        const result = await stripe.confirmCardPayment(pi.clientSecret, {
          payment_method: { card: elements.getElement(CardElement) },
        });
        if (result.error) {
          throw new Error(result.error.message || "Payment failed");
        }
        if (result.paymentIntent.status !== "succeeded") {
          throw new Error("Payment was not completed");
        }
        await postJson(`${API}/order/checkout`, { paymentIntentId: pi.paymentIntentId });
      }
      notyf.success("Order placed successfully!");
      navigate("/profile");
    } catch (err) {
      notyf.error(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        {isEmpty && (
          <Alert variant="warning" className="mt-4">
            Your cart is empty. <a href="/cart">Go back to your cart</a>.
          </Alert>
        )}
        <AppCheckoutForm />
        <AppPaymentMethod
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />
        <div className="d-flex justify-content-end mb-5">
          <Button type="submit" variant="primary" disabled={submitting || isEmpty}>
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Processing…
              </>
            ) : (
              `Complete order — ₱${cartTotal}`
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
}
