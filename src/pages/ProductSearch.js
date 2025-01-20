import { Col, Row, Container } from "react-bootstrap";
import { Form, FormControl } from "react-bootstrap";
import AppCard from "../components/Card";
import { useEffect, useState } from "react";
import { Notyf } from "notyf";

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const notyf = new Notyf();

  function fetchProducts(e) {
    e.preventDefault();

    fetch(`${process.env.REACT_APP_API_BASE_URL}/product/search-by-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: search,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (
          data.message === "Invalid product name" ||
          data.message === "No products found"
        ) {
          notyf.error("No products found");
        }
        setResults(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/product/active`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      });
  });
  const sortProducts = [...products].sort(
    (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
  );

  return (
    <Container className="my-5">
      <Row className="mt-5 mb-3">
        <Col>
          <h1 className="fw-bolder">Products</h1>
          <Form onKeyUp={(e) => fetchProducts(e)}>
            <FormControl
              type="text"
              placeholder="Search"
              defaultValue=""
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Form>
        </Col>
      </Row>
      <Row className="d-flex">
        {results.length > 0
          ? results.map((product) => {
              return (
                <Col
                  className="px-0 mx-auto flex-fill"
                  md={4}
                  key={product._id}
                >
                  <AppCard productProp={product} />
                </Col>
              );
            })
          : sortProducts.map((product) => {
              return (
                <Col
                  className="px-0 mx-auto flex-fill"
                  md={4}
                  key={product._id}
                >
                  <AppCard productProp={product} />
                </Col>
              );
            })}
      </Row>
    </Container>
  );
}
