import { Container, Row, Col, InputGroup, Form, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { notyf } from "../utils/notify";
import { useNavigate } from "react-router-dom";


console.log("Sending request to:", `${process.env.REACT_APP_API_BASE_URL}/users/register`);

export default function AppForm() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNo, setMobileNo] = useState(0);
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  console.log(firstName);
  console.log(lastName);
  console.log(email);
  console.log(mobileNo);
  console.log(image);
  console.log(password);
  console.log(confirmPassword);

  useEffect(() => {
    if (
      firstName !== "" &&
      lastName !== "" &&
      email !== "" &&
      mobileNo !== "" &&
      image !== "" &&
      password !== "" &&
      confirmPassword !== "" &&
      password === confirmPassword &&
      mobileNo.length === 11
    ) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
    //array of dependencies, the effect/side-effect/function will run when there are changes with our state
  }, [
    firstName,
    lastName,
    email,
    image,
    mobileNo,
    password,
    confirmPassword,
    isActive,
  ]);

  function registerUser(e) {
    e.preventDefault();
    const formContent = e.currentTarget;
    if (formContent.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      fetch(`${process.env.REACT_APP_API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: email,
          mobileNo: mobileNo,
          image: image,
          password: password,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.message === "User registered successfully") {
            console.log(data);
            setFirstName("");
            setLastName("");
            setEmail("");
            setMobileNo("");
            setPassword("");
            setConfirmPassword("");
            navigate("/login");
            notyf.success("Registration successful");
          }
        });
    }
    setValidated(true);
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
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
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
              onChange={(e) => {
                setLastName(e.target.value);
              }}
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
                aria-describedby="inputGroupPrepend"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
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
              onChange={(e) => {
                setMobileNo(e.target.value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid mobile number.
            </Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row className="mb-3 justify-content-md-center">
          <Form.Group as={Col} md="6" controlId="image">
            <Form.Label>Upload Avatar:</Form.Label>
            <Form.Control
              type="text"
              value={image}
              onChange={(e) => {
                setImage(e.target.value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              Please provide an accepted file type.
            </Form.Control.Feedback>
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
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,20}$"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid password.
            </Form.Control.Feedback>
            <Form.Text muted>
              Your password must be 8-20 characters long, contain letters and
              numbers, and must not contain spaces, special characters, or
              emoji.
            </Form.Text>
          </Form.Group>
        </Row>

        <Row className="mb-3 justify-content-md-center">
          <Form.Group as={Col} md="6" controlId="verifyPassword">
            <Form.Label>Verify Password:</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              aria-describedby="passwordHelpBlock"
              required
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,20}$"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              Password Do Not Match.
            </Form.Control.Feedback>
            <Form.Text muted>
              Your password must be the same as above.
            </Form.Text>
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
            <Button type="submit" className="btn btn-dark text-white">
              Sign Up
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
