// components/QuantitySelector.js
import React, { useEffect, useState } from "react";
import { Button, InputGroup, FormControl } from "react-bootstrap";
import { useCart } from "../context/CartContext";
import { toastError } from "../utils/notify";
import { maxPurchasable } from "../utils/stock";

// Quantity control for one cart line. `quantity` is what the server has; `stock` is the
// product's current stock (from the populated cart). It never offers more than the server will
// accept, and if a change is refused it snaps back to the server's quantity.
export default function QuantitySelector({ productId, quantity, stock }) {
  const { setQuantity, retry } = useCart();
  const [draft, setDraft] = useState(String(quantity));
  const [busy, setBusy] = useState(false);

  // Follow the server: after any refetch (or a rejected change) show what is really in the cart.
  useEffect(() => {
    setDraft(String(quantity));
  }, [quantity]);

  const limit = maxPurchasable(stock);
  // If stock ran out below what is already in the cart, allow reducing but never increasing.
  const cap = limit > 0 ? limit : quantity;
  const clamp = (n) => Math.max(1, Math.min(Math.floor(Number(n) || 1), cap));

  async function commit(next) {
    if (busy) return;
    const n = clamp(next);
    setDraft(String(n));
    if (n === quantity) return;

    setBusy(true);
    try {
      await setQuantity(productId, n);
    } catch (err) {
      toastError(err);
      setDraft(String(quantity));
      // The rejection usually means stock moved; pull the latest numbers.
      retry(); // a failure is kept in the cart's error state, which the cart page shows
    } finally {
      setBusy(false);
    }
  }

  return (
    <InputGroup className="mt-2 quantity-selector" style={{ maxWidth: "140px" }}>
      <Button
        variant="outline-secondary"
        type="button"
        aria-label="Decrease quantity"
        disabled={busy || quantity <= 1}
        onClick={() => commit(quantity - 1)}
      >
        -
      </Button>
      <FormControl
        type="number"
        aria-label="Quantity"
        value={draft}
        min={1}
        max={cap}
        disabled={busy}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(draft);
          }
        }}
      />
      <Button
        variant="outline-secondary"
        type="button"
        aria-label="Increase quantity"
        disabled={busy || quantity >= cap}
        onClick={() => commit(quantity + 1)}
      >
        +
      </Button>
    </InputGroup>
  );
}
