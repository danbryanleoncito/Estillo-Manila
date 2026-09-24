import { Container, Row, Col, InputGroup, Form, Button, Spinner } from "react-bootstrap";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { notyf, toastError } from "../utils/notify";

// Same rule the field's `pattern` enforces (the server has its own, looser one).
const PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,20}$";

export default function AppForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const passwordsDiffer = confirmPassword !== "" && confirmPassword !== password;

  async function registerUser(e) {
    e.preventDefault();
    setValidated(true);
    if (submitting) return;
    if (e.currentTarget.checkValidity() === false || password !== confirmPassword) {
      e.stopPropagation();
      if (password !== confirmPassword) notyf.error("The two passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await api("/users/register", {
        method: "POST",
        auth: false,
        body: { firstName, lastName, email: email.trim(), mobileNo, image, password },
      });
      notyf.success("Registration successful");
      navigate("/login");
    } catch (err) {
      // e.g. "That email is already registered", or the server's password rule.
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container className="mt-5">
      <h1 className="d-flex justify-content-md-center fw-bolder">Register</h1>
      <Form noValidate validated={validated} onSubmit={registerUser}>
        <Row className="mb-3 justify-content-md-center">
          <Form.Group as={Col} md="6" controlId="firstName">
            <Form.Label>First name:</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
        </Row>

        <Row className="mb-3 justify-content-md-center">
          <Form.Group as={Col} md="6" controlId="lastName">
            <Form.Label>Last name:</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
        </Row>

        <Row className="mb-3 justify-content-md-center">
          <Form.Group as={Col} md="6" controlId="email">
            <Form.Label>Email:</Form.Label>
            <InputGroup hasValidation>
              <InputGroup.Text>@</InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Please input proper email.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Row>

        <Row className="mb-3 justify-content-md-center">
          <Form.Group as={Col} md="6" controlId="mobileNo">
            <Form.Label>Mobile Number:</Form.Label>
            <Form.Control
              type="tel"
              placeholder="0912 345 6789"
              required
              pattern="^09[0-9]{9}$"
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid mobile number (11 digits, starting with 09).
            </Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row className="mb-3 justify-content-md-center">
          <Form.Group as={Col} md="6" controlId="image">
            <Form.Label>Avatar image link (optional):</Form.Label>
            <Form.Control
              type="text"
              placeholder="https://…"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3 justify-content-md-center">
          <Form.Group as={Col} md="6" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              aria-describedby="passwordHelpBlock"
              required
              pattern={PASSWORD_PATTERN}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid password.
            </Form.Control.Feedback>
            <Form.Text muted id="passwordHelpBlock">
              8-20 characters with a lowercase letter, an uppercase letter, a number and one of
              @ $ ! % * ? &amp; #. No spaces or emoji.
            </Form.Text>
          </Form.Group>
        </Row>

        <Row className="mb-3 justify-content-md-center">
          <Form.Group as={Col} md="6" controlId="verifyPassword">
            <Form.Label>Verify Password:</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              required
              isInvalid={passwordsDiffer}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">Passwords do not match.</Form.Control.Feedback>
          </Form.Group>
        </Row>

        <Row className="mb-3 justify-content-md-center">
          <Form.Group as={Col} md="6" controlId="termsAndConditions">
            <Form.Check
              required
              label="Agree to terms and conditions"
              feedback="You must agree before submitting."
              feedbackType="invalid"
            />
          </Form.Group>
        </Row>

        <Row className="mb-3 justify-content-md-center">
          <Col md={6}>
            <Button type="submit" className="btn btn-dark text-white" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Signing up…
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </Col>
        </Row>
      </Form>
      <p className="d-flex justify-content-md-center">
        Already have an account?&nbsp;<Link to="/login">Click here</Link>
        &nbsp;to log in.
      </p>
    </Container>
  );
}
