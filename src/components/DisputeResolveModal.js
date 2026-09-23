import { useEffect, useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { api } from "../utils/api";
import { notyf, toastError } from "../utils/notify";
import { refundPreview, timeLeft, validateKeep } from "../utils/orders";

// Lets the customer decide what to do with a paid line that was only partly in stock: cancel the
// line (full refund for it) or keep the units being held for them (refund for the rest).
// `onDone` runs after the server has answered so the parent can reload orders and disputes.
export default function DisputeResolveModal({ dispute, show, onHide, onDone }) {
  const [choice, setChoice] = useState("reduce");
  const [keep, setKeep] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Start every dispute from the useful default: keep everything that is being held.
  useEffect(() => {
    if (dispute) {
      setChoice("reduce");
      setKeep(String(dispute.reservedQuantity));
      setError(null);
    }
  }, [dispute]);

  if (!dispute) return null;

  const { requestedQuantity, reservedQuantity, unitPrice } = dispute;
  const keepCheck = validateKeep(keep, reservedQuantity);
  const cancelling = choice === "cancel";
  const refund = cancelling
    ? requestedQuantity * unitPrice
    : keepCheck.ok
    ? refundPreview(requestedQuantity, keepCheck.n, unitPrice)
    : null;
  const remaining = timeLeft(dispute.expiresAt);

  async function submit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!cancelling && !keepCheck.ok) {
      setError(keepCheck.message);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api(`/order/disputes/${dispute._id}/resolve`, {
        method: "POST",
        body: cancelling ? { action: "cancel" } : { action: "reduce", quantity: keepCheck.n },
      });
      notyf.success(
        cancelling ? "Item cancelled. Your refund is on its way." : "Order updated. Your refund is on its way."
      );
      await onDone();
      onHide();
    } catch (err) {
      if (err.status === 409 || err.status === 502) {
        // 409: already resolved (another tab, or it expired), nothing left to decide.
        // 502: the choice was saved and only the refund call failed; the server retries it.
        // Either way the right move is to refresh and close.
        notyf.open({ type: "warning", message: err.message });
        await onDone();
        onHide();
      } else if (err.status === 400) {
        setError(err.message);
      } else {
        toastError(err);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal show={show} onHide={submitting ? undefined : onHide} centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>Resolve: {dispute.productName || "item"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You paid for <strong>{requestedQuantity}</strong>, but only{" "}
            <strong>{reservedQuantity}</strong> {reservedQuantity === 1 ? "was" : "were"} in stock.
            We are holding {reservedQuantity === 1 ? "it" : "them"} for you.{" "}
            <span className={remaining.expired ? "text-danger" : "text-muted"}>
              {remaining.expired
                ? "This is about to be cancelled automatically."
                : `If you do nothing it is cancelled automatically (${remaining.label}).`}
            </span>
          </p>

          <Form.Check
            type="radio"
            id="dispute-reduce"
            name="dispute-choice"
            className="mb-2"
            label={`Keep fewer (up to ${reservedQuantity})`}
            checked={!cancelling}
            onChange={() => setChoice("reduce")}
            disabled={submitting}
          />
          {!cancelling && (
            <Form.Group className="ms-4 mb-3">
              <Form.Label htmlFor="dispute-keep" className="small mb-1">
                How many do you want to keep?
              </Form.Label>
              <Form.Control
                id="dispute-keep"
                type="number"
                min={1}
                max={reservedQuantity}
                step={1}
                value={keep}
                isInvalid={keep !== "" && !keepCheck.ok}
                onChange={(e) => setKeep(e.target.value)}
                disabled={submitting}
              />
              <Form.Control.Feedback type="invalid">{keepCheck.message}</Form.Control.Feedback>
            </Form.Group>
          )}

          <Form.Check
            type="radio"
            id="dispute-cancel"
            name="dispute-choice"
            className="mb-3"
            label="Cancel this item"
            checked={cancelling}
            onChange={() => setChoice("cancel")}
            disabled={submitting}
          />

          <p className="mb-0" aria-live="polite">
            {refund === null ? (
              "Enter how many to keep to see your refund."
            ) : (
              <>
                You will be refunded <strong>&#x20B1;{refund}</strong>.
              </>
            )}
          </p>
          {error && (
            <Alert variant="danger" className="mt-3 mb-0">
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={submitting}>
            Decide later
          </Button>
          <Button
            type="submit"
            variant={cancelling ? "danger" : "dark"}
            disabled={submitting || (!cancelling && !keepCheck.ok)}
          >
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Saving…
              </>
            ) : cancelling ? (
              "Cancel item"
            ) : (
              "Confirm"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
