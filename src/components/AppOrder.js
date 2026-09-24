import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Container, Button, Table, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { openDisputes } from "../utils/orders";
import { PaymentBadge } from "./badges";
import OrderLines from "./OrderLines";
import LoadError from "./LoadError";

export default function AppOrder() {
  const [orders, setOrders] = useState([]);
  const [disputes, setDisputes] = useState([]);
  // Disputes whose customer already chose and whose refund is still going through.
  const [processing, setProcessing] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  // A failed load must not read as "no orders".
  const [error, setError] = useState(null);
  const [incidentsError, setIncidentsError] = useState(false);

  // Never rejects: failures are kept in state and shown with a Retry button. (This page used to
  // refetch endlessly, and crashed whenever the response was not \`{ orders: [...] }\`.)
  const load = useCallback(async () => {
    setError(null);
    try {
      const [orderData, disputeData] = await Promise.all([
        api("/order/all-orders", { emptyOn404: { orders: [] } }),
        api("/order/disputes/all", { emptyOn404: { disputes: [] } }),
      ]);
      const list = Array.isArray(orderData && orderData.orders) ? orderData.orders : [];
      setOrders([...list].sort((a, b) => new Date(b.orderedOn) - new Date(a.orderedOn)));
      const all = Array.isArray(disputeData && disputeData.disputes) ? disputeData.disputes : [];
      setDisputes(openDisputes(all));
      setProcessing(all.filter((d) => d.status === "Resolving"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoaded(true);
    }

    // Separate, so a failure here never hides the orders. 404 = a backend that predates incidents.
    try {
      const data = await api("/order/incidents", { emptyOn404: { incidents: [] } });
      setIncidents(Array.isArray(data && data.incidents) ? data.incidents : []);
      setIncidentsError(false);
    } catch (err) {
      setIncidentsError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Orders with a dispute still waiting on the customer. Admins can see them but only the
  // customer can resolve one.
  const disputedOrders = useMemo(() => new Set(disputes.map((d) => String(d.orderId))), [disputes]);

  const processingByLine = useMemo(() => {
    const map = {};
    processing.forEach((d) => {
      map[d.lineId] = d;
    });
    return map;
  }, [processing]);

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

      {incidents.length > 0 && (
        <Alert variant="warning">
          <Alert.Heading as="h5">
            {incidents.length === 1 ? "1 problem needs attention" : `${incidents.length} problems need attention`}
          </Alert.Heading>
          <ul className="mb-0">
            {incidents.map((incident) => (
              <li key={incident._id}>
                {incident.message}{" "}
                <span className="text-muted small">
                  ({incident.count > 1 ? `${incident.count} times, ` : ""}last{" "}
                  {new Date(incident.lastSeen).toLocaleString("en-US")})
                </span>
              </li>
            ))}
          </ul>
        </Alert>
      )}
      {incidentsError && (
        <p className="text-muted small">Could not check for problems that need attention.</p>
      )}

      {error ? (
        <LoadError message="We could not load the orders." onRetry={load} />
      ) : !loaded ? (
        <p className="text-muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-muted">There are no orders yet.</p>
      ) : (
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
                  <OrderLines lines={order.productsOrdered} processingByLine={processingByLine} />
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
      )}
    </Container>
  );
}
