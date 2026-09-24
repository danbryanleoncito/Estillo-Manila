import React, { useState, useContext } from "react";
import { Form, Button, Container, Row, Col, Spinner } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";

import { api } from "../utils/api";
import { notyf, toastError } from "../utils/notify";
import UserContext from "../context/UserContext";

function Login() {
  const { user, setUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function authenticate(e) {
    // Prevents page redirection via form submission
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const login = await api("/users/login", {
        method: "POST",
        auth: false,
        body: { email: email.trim(), password },
      });

      // Stores the token of the authenticated user in the local storage
      localStorage.setItem("token", login.access);
      const me = await api("/users/details");

      // Changes the global "user" state to store the "id" and the "isAdmin" property of the user
      // which will be used for validation across the whole application
      setUser({ id: me._id, isAdmin: me.isAdmin });
      setEmail("");
      setPassword("");
      notyf.success("You are now logged in");
    } catch (err) {
      // A token whose details could not be fetched is not a login.
      localStorage.removeItem("token");
      if (err.status === 401 || err.status === 404) {
        // Same message for "no such email" and "wrong password", so the form does not reveal
        // which emails have an account.
        notyf.error("Incorrect email or password");
      } else {
        toastError(err);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return user.id !== null ? (
    user.isAdmin ? (
      <Navigate to="/admin" />
    ) : (
      <Navigate to="/" />
    )
  ) : (
    <Container className="my-5 py-5">
      <Row className="justify-content-md-center py-5">
        <Col xs={12} md={6}>
          <h1 className="text-center mb-4 fw-bolder">Login</h1>
          <Form onSubmit={authenticate}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email:</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <div className="text-center">
              <Button type="submit" className="w-20 btn-dark" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Logging in…
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </Form>
          <p className="text-center mt-4">
            Don't have an account yet?&nbsp;
            <Link to="/register">Click here</Link>&nbsp;to register.
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
