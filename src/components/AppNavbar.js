import { useState, useContext, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
// import { FaRegUserCircle } from "react-icons/fa";
// import { RiShoppingBagLine } from "react-icons/ri";
import { NavLink } from "react-router-dom";
import UserContext from "../context/UserContext";
import { Badge } from "react-bootstrap";

export default function NavigationBar() {
  const { user } = useContext(UserContext);
  const [cartNumber, setCartNumber] = useState(0);

  async function getNumberCart() {
    if (user.id !== null && !typeof cartNumber === "undefined") {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/cart/get-cart`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setCartNumber(data.cartItems.length);
        });
    }
  }

  useEffect(() => {
    getNumberCart();
  });

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          <img
            alt="logo-image"
            className="d-inline-block align-top"
            src="/Logo/estilo-manila.png"
            width={100}
            height={35}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="w-100">
            <Nav.Link as={NavLink} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/product">
              Products
            </Nav.Link>
            {user.id !== null ? (
              <div className="d-flex justify-content-end ms-auto">
                <Nav.Link as={NavLink} to="/cart" exact="true">
                  <svg class="svg-icon" viewBox="0 0 20 20">
                    <path
                      fill="none"
                      d="M17.696,9.368H2.305c-0.189,0-0.367,0.092-0.478,0.245c-0.11,0.155-0.141,0.352-0.08,0.532l2.334,6.918c0.081,0.238,0.305,0.4,0.556,0.4h10.735c0.253,0,0.478-0.162,0.557-0.402l2.323-6.917c0.062-0.179,0.03-0.376-0.079-0.531C18.062,9.459,17.886,9.368,17.696,9.368z M14.95,16.287H5.062l-1.938-5.743h13.753L14.95,16.287z"
                    ></path>
                    <path
                      fill="none"
                      d="M6.345,7.369c0.325,0,0.588-0.263,0.588-0.588c0-1.691,1.376-3.067,3.067-3.067c1.691,0,3.067,1.376,3.067,3.067c0,0.325,0.264,0.588,0.588,0.588c0.326,0,0.589-0.263,0.589-0.588c0-2.34-1.904-4.243-4.244-4.243c-2.34,0-4.244,1.903-4.244,4.243C5.757,7.106,6.02,7.369,6.345,7.369z"
                    ></path>
                  </svg>
                  <sup>
                    <Badge pill bg="dark">
                      {typeof cartNumber !== "undefined" ? cartNumber : 0}
                    </Badge>
                  </sup>
                </Nav.Link>
                <NavDropdown
                  title={
                    <svg class="svg-icon" viewBox="0 0 20 20">
                      <path
                        fill="none"
                        d="M14.023,12.154c1.514-1.192,2.488-3.038,2.488-5.114c0-3.597-2.914-6.512-6.512-6.512
                      c-3.597,0-6.512,2.916-6.512,6.512c0,2.076,0.975,3.922,2.489,5.114c-2.714,1.385-4.625,4.117-4.836,7.318h1.186
                      c0.229-2.998,2.177-5.512,4.86-6.566c0.853,0.41,1.804,0.646,2.813,0.646c1.01,0,1.961-0.236,2.812-0.646
                      c2.684,1.055,4.633,3.568,4.859,6.566h1.188C18.648,16.271,16.736,13.539,14.023,12.154z M10,12.367
                      c-2.943,0-5.328-2.385-5.328-5.327c0-2.943,2.385-5.328,5.328-5.328c2.943,0,5.328,2.385,5.328,5.328
                      C15.328,9.982,12.943,12.367,10,12.367z"
                      ></path>
                    </svg>
                  }
                  id="basic-nav-dropdown "
                >
                  <Nav.Link as={NavLink} to="/profile" exact="true">
                    Profile
                  </Nav.Link>
                  {user.isAdmin === true ? (
                    <Nav.Link as={NavLink} to="/admin" exact="true">
                      Admin
                    </Nav.Link>
                  ) : (
                    ""
                  )}
                  <Nav.Link as={NavLink} to="/logout">
                    Logout
                  </Nav.Link>{" "}
                </NavDropdown>
              </div>
            ) : (
              <NavDropdown
                title={
                  <svg class="svg-icon" viewBox="0 0 20 20">
                    <path
                      fill="none"
                      d="M14.023,12.154c1.514-1.192,2.488-3.038,2.488-5.114c0-3.597-2.914-6.512-6.512-6.512
                  c-3.597,0-6.512,2.916-6.512,6.512c0,2.076,0.975,3.922,2.489,5.114c-2.714,1.385-4.625,4.117-4.836,7.318h1.186
                  c0.229-2.998,2.177-5.512,4.86-6.566c0.853,0.41,1.804,0.646,2.813,0.646c1.01,0,1.961-0.236,2.812-0.646
                  c2.684,1.055,4.633,3.568,4.859,6.566h1.188C18.648,16.271,16.736,13.539,14.023,12.154z M10,12.367
                  c-2.943,0-5.328-2.385-5.328-5.327c0-2.943,2.385-5.328,5.328-5.328c2.943,0,5.328,2.385,5.328,5.328
                  C15.328,9.982,12.943,12.367,10,12.367z"
                    ></path>
                  </svg>
                }
                className="justify-content-end ms-auto"
                id="basic-nav-dropdown "
              >
                <NavDropdown.Item as={NavLink} to="/login">
                  Login
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/register">
                  Register
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
