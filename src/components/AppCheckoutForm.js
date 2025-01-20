import React from "react";
import { Form, Button, Col, Row, Container } from "react-bootstrap";

const AppCheckoutForm = () => {
  return (
    <Container className="my-5 py-5">
      <Form>
        {/* Contact Section */}
        <h4>Contact</h4>
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="Enter email" />
        </Form.Group>
        <Form.Check type="checkbox" label="Email me with news and offers" />

        {/* Delivery Section */}
        <h4 className="mt-4">Delivery</h4>

        {/* Country / Region */}
        <Form.Group controlId="formCountry">
          <Form.Label>Country/Region</Form.Label>
          <Form.Control as="select">
            <option>United Arab Emirates</option>
            {/* Add more countries as needed */}
          </Form.Control>
        </Form.Group>

        {/* First Name / Last Name */}
        <Row>
          <Col>
            <Form.Group controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" placeholder="First name" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" placeholder="Last name" />
            </Form.Group>
          </Col>
        </Row>

        {/* Address */}
        <Form.Group controlId="formAddress">
          <Form.Label>Address</Form.Label>
          <Form.Control type="text" placeholder="Address" />
        </Form.Group>

        {/* Apartment/Suite */}
        <Form.Group controlId="formApartment">
          <Form.Label>Apartment, suite, etc.</Form.Label>
          <Form.Control type="text" placeholder="Apartment, suite, etc." />
        </Form.Group>

        {/* City / Emirate */}
        <Row>
          <Col>
            <Form.Group controlId="formCity">
              <Form.Label>City</Form.Label>
              <Form.Control type="text" placeholder="City" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formEmirate">
              <Form.Label>Emirate</Form.Label>
              <Form.Control as="select">
                <option>Choose...</option>
                {/* Add more emirates as needed */}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {/* Phone */}
        <Form.Group controlId="formPhone">
          <Form.Label>Phone</Form.Label>
          <Form.Control type="text" placeholder="Phone number" />
        </Form.Group>

        {/* Save this information for next time */}
        <Form.Check
          type="checkbox"
          label="Save this information for next time"
        />

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default AppCheckoutForm;
