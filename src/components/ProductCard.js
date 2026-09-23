import { Row, Col, Badge } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import { stockState } from "../utils/stock";

// The one product card used on the home page, the products page and search. Sold-out
// products stay visible (dimmed, with a badge) so customers can still open them.
export default function ProductCard({ product }) {
  const { _id, name, price, image, stock } = product;
  const state = stockState(stock);

  return (
    <Link to={`/product/${_id}`}>
      <Card
        className={`card rounded-0${state === "out" ? " card-sold-out" : ""}`}
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent, #000), url(${image})`,
        }}
      >
        {state !== "ok" && (
          <Badge
            className="stock-badge position-absolute top-0 end-0 m-3"
            bg={state === "out" ? "dark" : "warning"}
            text={state === "out" ? undefined : "dark"}
          >
            {state === "out" ? "Sold out" : `Only ${stock} left`}
          </Badge>
        )}
        <Card.Body className="position-absolute bottom-0 text-white">
          <Card.Title className=" fw-bolder">{name}</Card.Title>
          <Card.Footer>
            <Row>
              <Col className="ps-0">
                <Card.Text>&#x20B1;{price}</Card.Text>
              </Col>
              <Col className="pe-0">
                <Card.Text className="text-end">Details</Card.Text>
              </Col>
            </Row>
          </Card.Footer>
        </Card.Body>
      </Card>
    </Link>
  );
}
