import { useEffect, useState } from "react";
import { Container, Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function AppOrder() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/order/all-orders`, {
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
    <Container className="my-5">
      <h1 className="d-flex justify-content-md-center pt-5 pb-3 fw-bolder">
        User Orders
      </h1>
      <div className="d-flex justify-content-md-center mb-5">
        <Button
          as={Link}
          to="/admin"
          variant="light"
          className="btn btn-outline-dark"
        >
          Show Products
        </Button>
      </div>
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
            const date = new Date(order.orderedOn).toLocaleDateString("en-US");
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
    </Container>
  );
}
