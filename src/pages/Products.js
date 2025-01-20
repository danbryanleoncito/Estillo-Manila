import { Container, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import PreviewProducts from "../components/PreviewProducts";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/product/active`)
      .then((res) => res.json())
      .then((data) => {
        const numbers = [];
        const featured = [];

        const generateRandomNums = () => {
          let randomNum = Math.floor(Math.random() * data.length);

          if (numbers.indexOf(randomNum) === -1) {
            numbers.push(randomNum);
          } else {
            generateRandomNums();
          }
        };

        for (let i = 0; i < 3; i++) {
          generateRandomNums();

          featured.push(
            <Col>
              <PreviewProducts
                data={data[numbers[i]]}
                key={data[numbers[i]]._id}
              />
            </Col>
          );
        }
        setProducts(featured);
      });
  }, []);
  return (
    <Container className="my-5">
      <Row className="mb-2">
        <h1 className="fw-bolder">Featured Products</h1>
      </Row>
      <Row>{products}</Row>
    </Container>
  );
}
