import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import UserContext from "./UserContext";
import { api } from "../utils/api";
import { notyf } from "../utils/notify";

// Single source of truth for the cart. `get-cart` is the only cart endpoint that returns
// populated products (with `stock`), and the mutation endpoints return an unpopulated cart,
// so every mutation here refetches instead of trusting its own response.

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useContext(UserContext);
  const [cart, setCart] = useState(null);
  // False until the first cart fetch has finished (successfully or not), so pages can tell
  // "still loading" apart from "empty".
  const [loaded, setLoaded] = useState(false);
  // Message when the last fetch FAILED (server down, offline). Screens must show this instead of
  // treating a missing cart as an empty one.
  const [error, setError] = useState(null);

  const refreshCart = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setCart(null);
      setError(null);
      setLoaded(true);
      return null;
    }
    try {
      const data = await api("/cart/get-cart", { emptyOn404: null });
      setCart(data);
      setError(null);
      return data;
    } catch (err) {
      // 401/403: the token is missing or no longer valid, so there is no cart to show (App.js
      // signs the user out separately).
      if (err.status === 401 || err.status === 403) {
        setCart(null);
        setError(null);
        return null;
      }
      setError(err.message);
      throw err;
    } finally {
      setLoaded(true);
    }
  }, []);

  // For callers that only want the numbers refreshed. It never rejects because a failure is
  // already kept in `error`, which the cart and checkout screens show with a Retry button.
  const retry = useCallback(() => refreshCart().catch(() => null), [refreshCart]);

  useEffect(() => {
    // A different user means a different cart: forget the old one until the new one arrives.
    setLoaded(false);
    if (user.id !== null) {
      retry();
    } else {
      setCart(null);
      setError(null);
    }
  }, [user.id, retry]);

  // Lines whose product was deleted come back with `productId: null`; skip them.
  const lines = useMemo(
    () => ((cart && cart.cartItems) || []).filter((line) => line && line.productId),
    [cart]
  );
  const missingCount = ((cart && cart.cartItems) || []).length - lines.length;
  const count = lines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
  const totalPrice = (cart && cart.totalPrice) || 0;

  const quantityInCart = useCallback(
    (productId) => {
      const line = lines.find((l) => String(l.productId._id) === String(productId));
      return line ? Number(line.quantity) || 0 : 0;
    },
    [lines]
  );

  const mutate = useCallback(
    async (path, options) => {
      const result = await api(path, options);
      try {
        await refreshCart();
      } catch (err) {
        // The change WAS saved. Reporting this as a failure would make the customer repeat it
        // (adding twice), so say what happened; `error` also lets the cart screen offer Retry.
        notyf.open({
          type: "warning",
          message: "Your change was saved, but we could not refresh the cart. Please retry.",
        });
      }
      return result;
    },
    [refreshCart]
  );

  const value = useMemo(
    () => ({
      cart,
      loaded,
      error,
      lines,
      missingCount,
      count,
      totalPrice,
      quantityInCart,
      refreshCart,
      retry,
      addToCart: (productId, quantity) =>
        mutate("/cart/add-to-cart", { method: "POST", body: { productId, quantity } }),
      // Quantity must be >= 1; the backend rejects 0, so removal has its own call.
      setQuantity: (productId, quantity) =>
        mutate("/cart/update-cart-quantity", {
          method: "PATCH",
          body: { productId, quantity },
        }),
      removeItem: (productId) =>
        mutate(`/cart/${productId}/remove-from-cart`, { method: "PATCH", body: { productId } }),
      clearCart: () => mutate("/cart/clear-cart", { method: "PUT" }),
    }),
    [cart, loaded, error, lines, missingCount, count, totalPrice, quantityInCart, refreshCart, retry, mutate]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};

export default CartContext;
