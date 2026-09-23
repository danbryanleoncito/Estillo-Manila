import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../context/UserContext";
import { Link } from "react-router-dom";

import {
  Container,
  Row,
  Col,
  Form,
  Button,
  FormControl,
} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import { notyf, toastError } from "../utils/notify";
import { api } from "../utils/api";
import { useCart } from "../context/CartContext";

export default function ProductsView() {
  const { user } = useContext(UserContext);
  const { productId } = useParams();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const { addToCart: addLineToCart } = useCart();

  async function addToCart(e) {
    e.preventDefault();
    try {
      await addLineToCart(productId, Number(quantity));
      notyf.success("Added To Cart Successfully!");
    } catch (err) {
      // e.g. 409 "Only 3 of X available": show the server's message, not a success toast.
      toastError(err);
    }
  }

  // Load once per product. This used to have no dependency array, so it refetched on every render.
  useEffect(() => {
    let cancelled = false;
    api(`/product/${productId}`, { auth: false })
      .then((data) => {
        if (cancelled || !data) return;
        setName(data.name);
        setDescription(data.description);
        setPrice(data.price);
        setImage(data.image);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return (
    <Container className="my-5">
      <Row>
        <Col className="mb-4" md={4} lg={6}>
          <Card
            className="card card-product rounded-0"
            style={{
              backgroundImage: `linear-gradient(to bottom, transparent, #000), url(${image})`,
            }}
          >
            <h4 className="fw-bold text-white bottom-0 position-absolute mx-3">
              ESTILO <span className="fs-6 ">MNL</span>
            </h4>
          </Card>
        </Col>
        <Col className="product-details mb-4 p-4 position-relative">
          <h1 className="fw-bolder">{name}</h1>
          <h2>&#x20B1;{price}</h2>
          <p>{description}</p>
          {user.id !== null ? (
            <Form onSubmit={addToCart}>
              <Form.Label className="position-absolute quantity-label">
                Quantity
              </Form.Label>
              <FormControl
                type="number"
                className="position-absolute quantity"
                value={quantity}
                min={1}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <Button
                type="submit"
                className="btn btn-dark position-absolute add-to-cart"
              >
                Add To Cart
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
