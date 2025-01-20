import React, { useState, useContext } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";

import { Notyf } from "notyf";
import UserContext from "../context/UserContext";

function Login() {
  const notyf = new Notyf();
  const { user, setUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [isActive, setIsActive] = useState(true);

  function authenticate(e) {
    // Prevents page redirection via form submission
    e.preventDefault();
    fetch(`${process.env.REACT_APP_API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.access !== undefined) {
          console.log(data.access);

          // Stores the token of the authenticated user in the local storage
          // Syntax: localStorage.setItem('propertyName', value)
          localStorage.setItem("token", data.access);
          retrieveUserDetails(data.access);

          // Clear input fields after submission
          setEmail("");
          setPassword("");

          notyf.success(`You are now logged in`);
        } else if (data.message === "Incorrect email or password") {
          notyf.error(`Incorrect email or password`);
        } else {
          notyf.error(`${email} does not exist`);
        }
      });
  }

  function retrieveUserDetails(token) {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/users/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        //Changes the global "user" state to store the "id" and the "isAdmin" property of the user which will be used for validation across the whole application
        setUser({
          id: data._id,
          isAdmin: data.isAdmin,
        });
      });
  }

  // useEffect(() => {
  //   if (email !== "" && password !== "") {
  //     setIsActive(true);
  //   } else {
  //     setIsActive(false);
  //   }
  // }, [email, password]);

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
          <Form onSubmit={(e) => authenticate(e)}>
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
              <Button type="submit" className="w-20 btn-dark">
                Login
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
