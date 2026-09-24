import { useEffect, useMemo, useState } from "react";
import { Container, Button, Table, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { toastError } from "../utils/notify";
import { openDisputes } from "../utils/orders";
import { PaymentBadge } from "./badges";
import OrderLines from "./OrderLines";

export default function AppOrder() {
  const [orders, setOrders] = useState([]);
  const [disputes, setDisputes] = useState([]);

  // Load once. This used to have no dependency array (an endless refetch loop) and crashed
  // on `orders.map` whenever the response was not `{ orders: [...] }`.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api("/order/all-orders", { emptyOn404: { orders: [] } }),
      api("/order/disputes/all", { emptyOn404: { disputes: [] } }),
    ])
      .then(([orderData, disputeData]) => {
        if (cancelled) return;
        const list = Array.isArray(orderData && orderData.orders) ? orderData.orders : [];
        setOrders([...list].sort((a, b) => new Date(b.orderedOn) - new Date(a.orderedOn)));
        setDisputes(openDisputes(disputeData && disputeData.disputes));
      })
      .catch((err) => !cancelled && toastError(err));
    return () => {
      cancelled = true;
    };
  }, []);

  // Orders with a dispute still waiting on the customer. Admins can see them but only the
  // customer can resolve one.
  const disputedOrders = useMemo(() => new Set(disputes.map((d) => String(d.orderId))), [disputes]);

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
      <Table className="mb-5" hover responsive>
        <thead>
          <tr>
            <th className="text-center">Order Date</th>
            <th className="text-center">Customer</th>
            <th className="text-center">Products</th>
            <th className="text-center">Status</th>
            <th className="text-center">Payment</th>
            <th className="text-center">Total Price</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr className="text-center align-middle" key={order._id}>
              <td>{new Date(order.orderedOn).toLocaleDateString("en-US")}</td>
              <td className="small">{order.userId}</td>
              <td>
                <OrderLines lines={order.productsOrdered} />
              </td>
              <td>
                {order.status}
                {disputedOrders.has(String(order._id)) && (
                  <div>
                    <Badge bg="warning" text="dark">
                      Open dispute
                    </Badge>
                  </div>
                )}
              </td>
              <td>
                <PaymentBadge status={order.paymentStatus} />
              </td>
              <td>
                &#x20B1;{order.totalPrice}
                {order.refundedAmount > 0 && (
                  <div className="small text-muted">&#x20B1;{order.refundedAmount} refunded</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
