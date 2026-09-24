import { Alert, Button } from "react-bootstrap";

// Shown where a list or page failed to LOAD. Without it a failed request looks identical to
// "there is nothing here" (empty cart, no orders, no products), which is a lie.
export default function LoadError({ message, onRetry, className = "my-4" }) {
  return (
    <Alert variant="danger" className={className} role="alert">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span>{message || "Something went wrong while loading this."}</span>
        {onRetry && (
          <Button variant="outline-danger" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </Alert>
  );
}
