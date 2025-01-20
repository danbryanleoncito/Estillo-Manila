import { Row, Col } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

export default function AppCard({ productProp }) {
  const { _id, name, price, image } = productProp;

  return (
    <Link to={`/product/${_id}`}>
      <Card
        className="card rounded-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent, #000), url(${image})`,
        }}
      >
        <Card.Body className="position-absolute bottom-0 text-white">
          <Card.Title className=" fw-bolder">{name}</Card.Title>
          <Card.Footer>
            <Row>
              <Col className="ps-0">
                <Card.Text>&#x20B1;{price}</Card.Text>
              </Col>
              <Col className="pe-0">
                <Link className="text-white" to={`/product/${_id}`}>
                  <Card.Text className="text-end">Details</Card.Text>
                </Link>
              </Col>
            </Row>
          </Card.Footer>
        </Card.Body>
      </Card>
    </Link>
  );
}
