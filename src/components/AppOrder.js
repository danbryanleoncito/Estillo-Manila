import { useEffect, useState } from "react";
import { Container, Button, Table, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { toastError } from "../utils/notify";

export default function AppOrder() {
  const [orders, setOrders] = useState([]);

  // Load once. This used to have no dependency array (an endless refetch loop) and crashed
  // on `orders.map` whenever the response was not `{ orders: [...] }`.
  useEffect(() => {
    let cancelled = false;
    api("/order/all-orders", { emptyOn404: { orders: [] } })
      .then((data) => {
        if (!cancelled) setOrders(Array.isArray(data && data.orders) ? data.orders : []);
      })
      .catch((err) => !cancelled && toastError(err));
    return () => {
      cancelled = true;
    };
  }, []);

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
            <th className="text-center">Payment</th>
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
                <td>
                  <Badge
                    bg={
                      order.paymentStatus === "Paid"
                        ? "success"
                        : order.paymentStatus === "Failed"
                        ? "danger"
                        : order.paymentStatus === "COD"
                        ? "secondary"
                        : "warning"
                    }
                  >
                    {order.paymentStatus || "Unpaid"}
                  </Badge>
                </td>
                <td>&#x20B1;{order.totalPrice}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
}
