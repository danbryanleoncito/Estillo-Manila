import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import UserContext from "./UserContext";
import { api } from "../utils/api";

// Single source of truth for the cart. `get-cart` is the only cart endpoint that returns
// populated products (with `stock`), and the mutation endpoints return an unpopulated cart,
// so every mutation here refetches instead of trusting its own response.

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useContext(UserContext);
  const [cart, setCart] = useState(null);

  const refreshCart = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setCart(null);
      return null;
    }
    try {
      const data = await api("/cart/get-cart", { emptyOn404: null });
      setCart(data);
      return data;
    } catch (err) {
      // 401/403: the token is missing or no longer valid, so there is no cart to show.
      if (err.status === 401 || err.status === 403) {
        setCart(null);
        return null;
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    if (user.id !== null) {
      refreshCart().catch(() => {});
    } else {
      setCart(null);
    }
  }, [user.id, refreshCart]);

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
      await refreshCart();
      return result;
    },
    [refreshCart]
  );

  const value = useMemo(
    () => ({
      cart,
      lines,
      missingCount,
      count,
      totalPrice,
      quantityInCart,
      refreshCart,
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
    [cart, lines, missingCount, count, totalPrice, quantityInCart, refreshCart, mutate]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};

export default CartContext;
