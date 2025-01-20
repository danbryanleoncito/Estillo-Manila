import React from "react";
import AppCheckoutForm from "../components/AppCheckoutForm";
import AppPaymentMethod from "../components/AppPaymentMethod";

export default function Checkout() {
  return (
    <>
      <AppCheckoutForm />
      <AppPaymentMethod />
    </>
  );
}
