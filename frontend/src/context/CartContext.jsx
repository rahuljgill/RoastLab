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

function makeCartItemId(prefix = "cb") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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

  // ✅ PRODUCTS: now always stored as { type: "product", productId, quantity }
  const addToCart = (productId, qty = 1) => {
    const pid = Number(productId);
    const q = Number(qty || 1);

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.type === "product" && Number(i.productId) === pid,
      );

      if (existing) {
        return prev.map((i) =>
          i.type === "product" && Number(i.productId) === pid
            ? { ...i, quantity: Number(i.quantity || 0) + q }
            : i,
        );
      }

      return [...prev, { type: "product", productId: pid, quantity: q }];
    });
  };

  const decreaseQty = (productId, qty = 1) => {
    const pid = Number(productId);
    const q = Number(qty || 1);

    setItems((prev) =>
      prev
        .map((i) => {
          if (i.type !== "product" || Number(i.productId) !== pid) return i;
          return { ...i, quantity: Number(i.quantity || 0) - q };
        })
        .filter((i) => i.type !== "product" || Number(i.quantity || 0) > 0),
    );
  };

  const removeFromCart = (productId) => {
    const pid = Number(productId);
    setItems((prev) =>
      prev.filter(
        (i) => !(i.type === "product" && Number(i.productId) === pid),
      ),
    );
  };

  const setQuantity = (productId, quantity) => {
    const pid = Number(productId);
    const q = Number(quantity);
    if (Number.isNaN(q)) return;

    setItems((prev) => {
      // Remove if <= 0
      if (q <= 0) {
        return prev.filter(
          (i) => !(i.type === "product" && Number(i.productId) === pid),
        );
      }

      const exists = prev.some(
        (i) => i.type === "product" && Number(i.productId) === pid,
      );

      if (!exists) {
        return [...prev, { type: "product", productId: pid, quantity: q }];
      }

      return prev.map((i) =>
        i.type === "product" && Number(i.productId) === pid
          ? { ...i, quantity: q }
          : i,
      );
    });
  };

  const addCustomBlendToCart = (customBlend) => {
    setItems((prev) => [
      ...prev,
      {
        cartItemId: makeCartItemId("cb"),
        type: "custom_blend",
        customBlend: {
          roast_option_id: customBlend.roast_option_id,
          grind_option_id: customBlend.grind_option_id,
          size_option_id: customBlend.size_option_id,
          extras: Array.isArray(customBlend.extras) ? customBlend.extras : [],

          // Names for UI
          roast_name: customBlend.roast_name ?? "",
          grind_name: customBlend.grind_name ?? "",
          size_name: customBlend.size_name ?? "",
          extras_names: Array.isArray(customBlend.extras_names)
            ? customBlend.extras_names
            : [],
        },
        price_estimate: Number(customBlend.price_estimate || 0),
        quantity: 1,
      },
    ]);
  };

  const removeCustomBlendFromCart = (cartItemId) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const clearCart = () => setItems([]);

  const uniqueCount = items.length;
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.quantity || 0), 0),
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
    addCustomBlendToCart,
    removeCustomBlendFromCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
