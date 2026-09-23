import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { api } from "../utils/api";
import { LineStatusBadge } from "./badges";
import { lineProductId, lineUnitPrice, storedLineName, timeLeft } from "../utils/orders";

// Product names for lines that predate the stored `name` (old orders only carry a productId).
// Looked up once per product and cached for the rest of the session.
const nameCache = new Map();

function useProductNames(ids) {
  const [, rerender] = useState(0);
  const key = ids.join(",");

  useEffect(() => {
    const missing = [...new Set(ids)].filter((id) => id && !nameCache.has(id));
    if (missing.length === 0) return undefined;
    let cancelled = false;
    Promise.all(
      missing.map((id) =>
        api(`/product/${id}`, { auth: false })
          .then((p) => nameCache.set(id, p && p.name ? p.name : null))
          .catch(() => nameCache.set(id, null))
      )
    ).then(() => {
      if (!cancelled) rerender((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return (id) => nameCache.get(id);
}

// The items of one order. `disputeByLine` maps an order line's _id to its open dispute; when
// `onResolve` is given (the customer's own orders) a Disputed line gets a Resolve button.
export default function OrderLines({ lines, disputeByLine = {}, onResolve }) {
  const legacyIds = (lines || [])
    .filter((l) => !storedLineName(l))
    .map((l) => lineProductId(l));
  const lookupName = useProductNames(legacyIds);

  return (
    <div className="text-start">
      {(lines || []).map((line, i) => {
        const name = storedLineName(line) || lookupName(lineProductId(line)) || "Product";
        const status = line.lineStatus || "Fulfilled";
        const requested = line.requestedQuantity ?? line.quantity;
        const cancelled = status === "Cancelled";
        const dispute = disputeByLine[line._id];
        const partial = status === "Disputed" || status === "Adjusted";
        return (
          <div key={line._id || i} className="mb-2">
            <div>
              <span className={cancelled ? "text-decoration-line-through text-muted" : ""}>
                {name}
              </span>{" "}
              <span className="text-muted">
                {cancelled
                  ? `× ${requested}`
                  : partial
                  ? `× ${line.quantity} of ${requested}`
                  : `× ${line.quantity}`}
              </span>{" "}
              {status !== "Fulfilled" && <LineStatusBadge status={status} />}
            </div>
            <div className="small text-muted">
              &#x20B1;{lineUnitPrice(line)} each
              {line.refundedAmount > 0 && <> &middot; &#x20B1;{line.refundedAmount} refunded</>}
              {status === "Disputed" && dispute && (
                <> &middot; held for you, {timeLeft(dispute.expiresAt).label}</>
              )}
            </div>
            {status === "Disputed" && dispute && onResolve && (
              <Button
                size="sm"
                variant="outline-dark"
                className="mt-1"
                onClick={() => onResolve(dispute)}
              >
                Resolve
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
