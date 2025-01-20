import { useEffect, useContext, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Image } from "react-bootstrap";
import { Card, CardText, CardTitle, CardBody, Table } from "react-bootstrap";
import UserContext from "../context/UserContext";
import { Navigate } from "react-router-dom";

export default function ProfileView() {
  const { user } = useContext(UserContext);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [image, setImage] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/users/details`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFullName(`${data.firstName} ${data.lastName}`);
        setEmail(data.email);
        setMobile(data.mobileNo);
        setImage(data.image);
        console.log(data);
      });
  });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/order/my-orders`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders);
        console.log(data.orders);
      });
  });

  return (
    <Container className="my-5 py-5">
      <Row>
        <Col className="justify-content-center d-flex">
          {user !== null ? (
            <Card className="mx-5 text-center p-5 w-50" width={150}>
              <CardTitle className="fw-bolder text-dark mb-2 fs-2 px-2">
                {fullName}
              </CardTitle>
              <Image
                className="profile-image mx-auto"
                src={image}
                fluid
                width={350}
              />
              <CardBody>
                <CardText className="fw-bolder text-dark fs-4 px-2 pt-2">
                  Email: {email}
                </CardText>
                <CardText className="fw-bolder text-dark fs-4 px-2">
                  Mobile: {mobile}
                </CardText>
              </CardBody>
            </Card>
          ) : (
            <Navigate to="/" />
          )}
        </Col>
      </Row>
      <Row className="mt-5">
        <h1 className="fw-bolder fs-1">My Orders</h1>
        <Table className="mb-5" hover>
          <thead>
            <tr>
              <th className="text-center">Order Date</th>
              <th className="text-center">Customer Name</th>
              <th className="text-center">Products</th>
              <th className="text-center">Status</th>
              <th className="text-center">Total Price</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const date = new Date(order.orderedOn).toLocaleDateString(
                "en-US"
              );
              return (
                <tr className="text-center" key={order._id}>
                  <td>{date}</td>
                  <td>{order.userId}</td>
                  <td>
                    {order.productsOrdered.map((product) => {
                      return <div>{product.productId}</div>;
                    })}
                  </td>
                  <td>{order.status}</td>
                  <td>&#x20B1;{order.totalPrice}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Row>
    </Container>
  );
}
