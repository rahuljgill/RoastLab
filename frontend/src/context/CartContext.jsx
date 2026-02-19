import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "roastlab_cart";

function readCartFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCartFromStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      //
    }
  }, [items]);

  const addToCart = (productId, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [...prev, { productId, quantity: qty }];
    });
  };

  const decreaseQty = (productId, qty = 1) => {
    setItems((prev) => {
      return prev
        .map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity - qty } : i,
        )
        .filter((i) => i.quantity > 0);
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const setQuantity = (productId, quantity) => {
    const q = Number(quantity);
    if (Number.isNaN(q)) return;

    setItems((prev) => {
      if (q <= 0) return prev.filter((i) => i.productId !== productId);
      const exists = prev.some((i) => i.productId === productId);
      if (!exists) return [...prev, { productId, quantity: q }];

      return prev.map((i) =>
        i.productId === productId ? { ...i, quantity: q } : i,
      );
    });
  };

  const clearCart = () => setItems([]);

  const uniqueCount = items.length;
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const value = {
    items,
    uniqueCount,
    itemCount,
    addToCart,
    decreaseQty,
    removeFromCart,
    setQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
