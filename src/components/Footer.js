import { Container, Row, Col } from "react-bootstrap";
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
            <li>Home</li>
            <li>Products</li>
            <li>Login</li>
            <li>Register</li>
            <li>Email Us</li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
}
