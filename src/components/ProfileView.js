import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, Container, Row, Col, Image, Table, Button } from "react-bootstrap";
import { Card, CardText, CardTitle, CardBody } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import UserContext from "../context/UserContext";
import { api } from "../utils/api";
import { toastError } from "../utils/notify";
import { openDisputes, timeLeft } from "../utils/orders";
import { PaymentBadge } from "./badges";
import OrderLines from "./OrderLines";
import DisputeResolveModal from "./DisputeResolveModal";

// The route is wrapped in <RequireAuth>, so a signed-in user is guaranteed by the time this renders.
export default function ProfileView() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [resolving, setResolving] = useState(null);
  // Set by checkout when some items were only partly available.
  const [notice, setNotice] = useState((location.state && location.state.notice) || null);

  useEffect(() => {
    let cancelled = false;
    api("/users/details")
      .then((data) => !cancelled && setProfile(data))
      .catch((err) => !cancelled && toastError(err));
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  // Orders and disputes together, because deciding on a dispute changes both. 404 means "none yet".
  const loadOrders = useCallback(async () => {
    const [orderData, disputeData] = await Promise.all([
      api("/order/my-orders", { emptyOn404: { orders: [] } }),
      api("/order/disputes", { emptyOn404: { disputes: [] } }),
    ]);
    const list = Array.isArray(orderData && orderData.orders) ? orderData.orders : [];
    setOrders([...list].sort((a, b) => new Date(b.orderedOn) - new Date(a.orderedOn)));
    setDisputes(openDisputes(disputeData && disputeData.disputes));
  }, []);

  useEffect(() => {
    loadOrders().catch((err) => toastError(err));
  }, [loadOrders, user.id]);

  // Reload for the modal without letting a failed reload look like a failed decision.
  const reload = useCallback(() => loadOrders().catch((err) => toastError(err)), [loadOrders]);

  const disputeByLine = useMemo(() => {
    const map = {};
    disputes.forEach((d) => {
      map[d.lineId] = d;
    });
    return map;
  }, [disputes]);

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "";

  return (
    <Container className="my-5 py-5">
      <Row>
        <Col className="justify-content-center d-flex">
          <Card className="mx-5 text-center p-5 w-50" width={150}>
            <CardTitle className="fw-bolder text-dark mb-2 fs-2 px-2">{fullName}</CardTitle>
            {profile && profile.image && (
              <Image className="profile-image mx-auto" src={profile.image} fluid width={350} />
            )}
            <CardBody>
              <CardText className="fw-bolder text-dark fs-4 px-2 pt-2">
                Email: {profile ? profile.email : ""}
              </CardText>
              <CardText className="fw-bolder text-dark fs-4 px-2">
                Mobile: {profile ? profile.mobileNo : ""}
              </CardText>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mt-5">
        <h1 className="fw-bolder fs-1">My Orders</h1>

        {notice && (
          <Alert variant={notice.variant || "info"} dismissible onClose={() => setNotice(null)}>
            {notice.text}
          </Alert>
        )}

        {disputes.length > 0 && (
          <Alert variant="warning">
            <Alert.Heading as="h5">
              {disputes.length === 1
                ? "1 item needs your decision"
                : `${disputes.length} items need your decision`}
            </Alert.Heading>
            <p className="mb-2">
              These were only partly in stock after you paid. We are holding what we have. Choose
              what to do before the deadline, or the item is cancelled and refunded automatically.
            </p>
            <ul className="mb-0">
              {disputes.map((d) => (
                <li key={d._id}>
                  <strong>{d.productName || "An item"}</strong>: you paid for {d.requestedQuantity},{" "}
                  {d.reservedQuantity} available ({timeLeft(d.expiresAt).label}){" "}
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 align-baseline"
                    onClick={() => setResolving(d)}
                  >
                    Resolve
                  </Button>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {orders.length === 0 ? (
          <p className="text-muted">You have not placed any orders yet.</p>
        ) : (
          <Table className="mb-5" hover responsive>
            <thead>
              <tr>
                <th className="text-center">Order Date</th>
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
                  <td>
                    <OrderLines
                      lines={order.productsOrdered}
                      disputeByLine={disputeByLine}
                      onResolve={setResolving}
                    />
                  </td>
                  <td>{order.status}</td>
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
      </Row>

      <DisputeResolveModal
        dispute={resolving}
        show={resolving !== null}
        onHide={() => setResolving(null)}
        onDone={reload}
      />
    </Container>
  );
}
