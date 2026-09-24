import React from "react";
import { Form, Col, Row, Container } from "react-bootstrap";
import { PHONE_PATTERN, POSTAL_PATTERN } from "../utils/address";

// Delivery address, controlled by the checkout page (`address` + `onChange(field, value)`). The
// browser's own validation (required / pattern) stops an incomplete form from being submitted, and
// the server checks it again.
const AppCheckoutForm = ({ address, onChange, disabled = false }) => {
  const field = (name) => ({
    value: address[name],
    onChange: (e) => onChange(name, e.target.value),
  });

  return (
    <Container className="my-5 py-5">
      <fieldset className="border-0 p-0" disabled={disabled}>
        <h4>Delivery</h4>
        <p className="text-muted">
          {disabled
            ? "Your payment already went through, so this address is the one saved with it."
            : "We deliver within the Philippines."}
        </p>

        <Form.Group controlId="shipCountry" className="mb-3">
          <Form.Label>Country</Form.Label>
          {/* Fixed: the store only delivers within the Philippines. */}
          <Form.Control type="text" value={address.country} readOnly disabled />
        </Form.Group>

        <Row>
          <Col md={7}>
            <Form.Group controlId="shipFullName" className="mb-3">
              <Form.Label>Full name</Form.Label>
              <Form.Control
                type="text"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder="Recipient's full name"
                {...field("fullName")}
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group controlId="shipPhone" className="mb-3">
              <Form.Label>Mobile number</Form.Label>
              <Form.Control
                type="tel"
                required
                pattern={PHONE_PATTERN}
                autoComplete="tel"
                placeholder="0917 123 4567"
                {...field("phone")}
              />
              <Form.Text muted>For the delivery rider.</Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="shipAddress1" className="mb-3">
          <Form.Label>Street address</Form.Label>
          <Form.Control
            type="text"
            required
            minLength={5}
            maxLength={200}
            autoComplete="address-line1"
            placeholder="House number and street"
            {...field("addressLine1")}
          />
        </Form.Group>

        <Form.Group controlId="shipAddress2" className="mb-3">
          <Form.Label>Apartment, unit, building (optional)</Form.Label>
          <Form.Control
            type="text"
            maxLength={100}
            autoComplete="address-line2"
            placeholder="Unit 4B, Rizal Tower"
            {...field("addressLine2")}
          />
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group controlId="shipCity" className="mb-3">
              <Form.Label>City / municipality</Form.Label>
              <Form.Control
                type="text"
                required
                minLength={2}
                maxLength={80}
                autoComplete="address-level2"
                placeholder="Makati"
                {...field("city")}
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group controlId="shipProvince" className="mb-3">
              <Form.Label>Province / region</Form.Label>
              <Form.Control
                type="text"
                required
                minLength={2}
                maxLength={80}
                autoComplete="address-level1"
                placeholder="Metro Manila"
                {...field("province")}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="shipPostal" className="mb-3">
              <Form.Label>Postal code</Form.Label>
              <Form.Control
                type="text"
                inputMode="numeric"
                required
                pattern={POSTAL_PATTERN}
                autoComplete="postal-code"
                placeholder="1200"
                {...field("postalCode")}
              />
            </Form.Group>
          </Col>
        </Row>
      </fieldset>
    </Container>
  );
};

export default AppCheckoutForm;
