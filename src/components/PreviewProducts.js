import { Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function PreviewProducts(props) {
  const { data } = props;

  const { _id, name, image, price } = data;

  console.log(data);

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
          <Card.Footer className="">
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
