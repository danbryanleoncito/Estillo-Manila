import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <Container className="footer p-5 border-top-1" fluid>
      <Row className="px-5">
        <Col lg={6}>
          <img
            alt="footer-logo"
            className="d-inline-block align-top mb-5"
            src="/Logo/estilo-manila.png"
            width={200}
            height={70}
          />
          <p>Own The Streets Of Manila</p>
          <p>
            Estilo Manila: Inspired by the vibrant streets of Manila, Estilo
            Manila blends Filipino heritage with modern streetwear. Each piece
            reflects the spirit of resilience, culture, and style—crafted for
            those who wear their identity with pride.
          </p>
          <p>&copy; Copyright, Estilo Manila, 2024</p>
        </Col>
        <Col lg={6} className="text-end">
          <h6>CUSTOMER CARE</h6>
          <ul className="footer-list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/product">Products</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <a href="mailto:support@estilomanila.com">Email Us</a>
            </li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
}
