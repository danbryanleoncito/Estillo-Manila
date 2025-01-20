import { Container, Row, Col } from "react-bootstrap";
// import { CiGlobe } from "react-icons/ci";
// import { CiDeliveryTruck } from "react-icons/ci";
// import { PiTShirtThin } from "react-icons/pi";
// import { CiFlag1 } from "react-icons/ci";

export default function SiteDescription() {
  return (
    <>
      <div
        className="banner d-flex justify-content-center align-items-center flex-column"
        style={{
          background: `linear-gradient(to bottom, transparent, #000), url("/SiteImages/site-2.jpg")`,
        }}
      >
        <h1 className="text-center fw-bold text-white">ESTILO</h1>
        <span className="fw-normal fs-3 text-white fw-5 mb-2">ᜁᜐ᜔ᜆᜒᜎᜓ</span>

        <p className="text-center text-white">
          "
          <b>
            <em>Estilo</em>
          </b>
          " is a Spanish word that translates to "<em>style</em>" in English. In
          Tagalog, "<em>estilo</em>" is also used to mean "<em>style</em>" or
          "manner.
        </p>
      </div>
      <Container className="my-5">
        <Row>
          <Col md={3} className="details text-center">
            {/*<CiGlobe className="fs-1 mb-2" />*/}
            <h5 className="fw-bold">Shipping Worldwide</h5>
          </Col>
          <Col md={3} className="details text-center">
            {/*<CiDeliveryTruck className="fs-1 mb-2" />*/}
            <h5 className="fw-bold">Fast Delivery</h5>
          </Col>
          <Col md={3} className="details text-center">
            {/*<PiTShirtThin className="fs-1 mb-2" />*/}
            <h5 className="fw-bold">Quality Print</h5>
          </Col>
          <Col md={3} className="details text-center">
            {/*<CiFlag1 className="fs-1 mb-2" />*/}
            <h5 className="fw-bold">Filipino-made</h5>
          </Col>
        </Row>
      </Container>
    </>
  );
}
