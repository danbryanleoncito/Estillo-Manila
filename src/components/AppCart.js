import Table from "react-bootstrap/Table";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import QuantitySelector from "./QuantitySelector";
import Image from "react-bootstrap/Image";
import { Container, Row, Col } from "react-bootstrap";
import { notyf, toastError } from "../utils/notify";
import { useCart } from "../context/CartContext";

export default function AppCart() {
  const navigate = useNavigate();
  // The cart lives in CartContext (fetched once, refreshed after every change). This page
  // used to refetch on every render, which never stopped.
  const { lines: cart, totalPrice, clearCart, removeItem } = useCart();

  function goToCheckout(e) {
    e.preventDefault();
    if (!cart || cart.length === 0) {
      notyf.error("Your cart is empty");
      return;
    }
    navigate("/checkout");
  }

  async function handleClear(e) {
    e.preventDefault();
    try {
      await clearCart();
      notyf.success("Cleared cart successfully!");
    } catch (err) {
      toastError(err);
    }
  }

  async function deleteItemFromCart(e, productId) {
    e.preventDefault();
    try {
      await removeItem(productId);
      notyf.success("Deleted item successfully!");
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
      <Row>
        <Table className="container mt-5">
          {typeof cart !== "undefined" ? (
            cart.map((crt) => {
              return (
                <>
                  <thead>
                    <tr>
                      <th colSpan={2}>{crt.productId.name}</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <Image
                          src={crt.productId.image}
                          width={130}
                          height={130}
                          roundedCircle
                        />
                      </td>
                      <td>
                        <p className="cart-description">
                          {crt.productId.description}
                        </p>
                        <div className="mt-3">
                          <span>Quantity:</span>
                          <QuantitySelector
                            quantity={crt.quantity}
                            stock={crt.productId.stock}
                            productId={crt.productId._id}
                          />
                        </div>
                      </td>
                      <td id="price">&#x20B1;{crt.productId.price}</td>
                      <td id="subtotal">&#x20B1;{crt.subtotal}</td>
                      <td>
                        <Form onSubmit={(e) => deleteItemFromCart(e, crt.productId._id)}>
                          <Button
                            type="submit"
                            variant="outline-danger"
                            size="sm"
                            className="mx-2"
                          >
                            Remove
                          </Button>
                        </Form>
                      </td>
                    </tr>
                  </tbody>
                </>
              );
            })
          ) : (
            <Container className="my-5 text-center py-5">
              <Row>
                <h3 className="fw-bolder text-center py-5 my-5">
                  {/*<TbMoodEmpty className="fs-1" />*/}
                  Cart Empty
                </h3>
              </Row>
            </Container>
          )}
          {typeof cart !== "undefined" ? (
            <tfoot>
              <tr>
                <td colSpan={3}>
                  <h3 className="fw-bolder">TOTAL: &#x20B1;{totalPrice}</h3>
                </td>
                <td>
                  <Form onSubmit={handleClear}>
                    <Button
                      type="submit"
                      variant="outline-danger"
                      className="m-2"
                    >
                      Clear
                    </Button>
                  </Form>
                </td>
                <td>
                  <Form onSubmit={goToCheckout}>
                    <Button type="submit" variant="outline-dark">
                      Checkout
                    </Button>
                  </Form>
                </td>
              </tr>
            </tfoot>
          ) : (
            ""
          )}
        </Table>
      </Row>
    </Container>
  );
}
