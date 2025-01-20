// components/QuantitySelector.js
import React, { useState } from "react";
import { Form, Button, InputGroup, FormControl } from "react-bootstrap";
import { Notyf } from "notyf";

export default function QuantitySelector({ propsValue, productId }) {
  const [quantity, setQuantity] = useState(propsValue);
  const id = productId;
  const notyf = new Notyf();

  function addToCart(e) {
    e.preventDefault();
    fetch(`${process.env.REACT_APP_API_BASE_URL}/cart/update-cart-quantity`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        productId: id,
        quantity: quantity,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        notyf.success("Updated Cart Successfully!");
        console.log(data);
      });
  }

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };
  const handleDecrement = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <Form onSubmit={addToCart}>
      <InputGroup
        className="mt-2 quantity-selector"
        style={{ maxWidth: "120px" }}
      >
        <Button
          variant="outline-secondary"
          type="submit"
          onClick={handleDecrement}
        >
          -
        </Button>
        <FormControl
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min="1"
        />
        <Button
          variant="outline-secondary"
          type="submit"
          onClick={handleIncrement}
        >
          +
        </Button>
      </InputGroup>
    </Form>
  );
}
