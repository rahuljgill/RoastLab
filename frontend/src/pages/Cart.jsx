import Navbar from "../components/Navbar";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

const roastPill = (roast = "") => {
  const r = (roast || "").toLowerCase();
  if (r.includes("light") && !r.includes("medium"))
    return "border-sky-400/40 text-sky-300 bg-sky-400/10";
  if (r.includes("dark") && !r.includes("medium"))
    return "border-orange-900/60 text-orange-300 bg-orange-900/20";
  if (r.includes("decaf"))
    return "border-purple-400/40 text-purple-300 bg-purple-400/10";
  return "border-amber-500/40 text-amber-300 bg-amber-500/10";
};

export default function Cart() {
  const navigate = useNavigate();
  const {
    items,
    addToCart,
    decreaseQty,
    removeFromCart,
    removeCustomBlendFromCart,
  } = useCart();

  const emptyCart = items.length === 0;

  // Convert cart items to correct format for backend
  const payload = useMemo(() => {
    return {
      items: items
        .map((i) => {
          if (i.type === "product") {
            return {
              type: "product",
              product_id: Number(i.productId),
              quantity: Number(i.quantity || 1),
            };
          }

          if (i.type === "custom_blend" && i.customBlend) {
            return {
              type: "custom_blend",
              cart_item_id: i.cartItemId,
              quantity: 1,
              custom_blend: {
                roast_option_id: Number(i.customBlend.roast_option_id),
                grind_option_id: Number(i.customBlend.grind_option_id),
                size_option_id: Number(i.customBlend.size_option_id),
                extras: Array.isArray(i.customBlend.extras)
                  ? i.customBlend.extras.map(Number)
                  : [],
              },
            };
          }

          return null;
        })
        .filter(Boolean),
    };
  }, [items]);

  const {
    data: previewData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["cartPreview", payload],
    enabled: !emptyCart,
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/cart/preview`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || "Failed to preview cart.");
      }
      return json;
    },
  });

  const cartRows = previewData?.items || [];

  const subtotal = Number(previewData?.subtotal || 0);
  const shipping = Number(previewData?.shipping || 0);
  const total = Number(previewData?.total || 0);

  return (
    <div className="bg-dark-bg text-dark-text min-h-screen font-(--font-body)">
      <Navbar alwaysVisible />

      <div className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs tracking-[0.25em] uppercase text-dark-muted">
              Checkout
            </p>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
              Cart
            </h1>
            <p className="text-dark-muted mt-3 max-w-2xl leading-relaxed">
              Review your items, adjust quantities, then head to secure
              checkout.
            </p>
          </div>

          {/* Empty cart */}
          {emptyCart && (
            <div className="rounded-3xl border border-dark-border bg-dark-surface px-6 py-16 text-center">
              <p className="text-dark-muted">
                Your cart is empty. Add some beans to get started.
              </p>
              <Link
                to="/shop"
                className="inline-block mt-6 bg-brand text-black px-6 py-3 rounded-xl font-semibold hover:bg-brand-hover transition"
              >
                Browse Shop
              </Link>
            </div>
          )}

          {!emptyCart && isLoading && (
            <div className="py-10 text-dark-muted">Calculating totals...</div>
          )}

          {!emptyCart && isError && (
            <div className="py-10 text-dark-muted">
              <span className="text-brand font-semibold">Error:</span>{" "}
              {error?.message || "Something went wrong."}
            </div>
          )}

          {/* Main UI */}
          {!emptyCart && !isLoading && !isError && (
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Items */}
              <div className="lg:col-span-2">
                <div className="rounded-3xl border border-dark-border overflow-hidden bg-dark-surface">
                  <div className="px-6 py-5 border-b border-dark-border flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Items ({items.length})
                    </span>
                    <Link
                      to="/shop"
                      className="text-sm text-brand hover:underline font-medium"
                    >
                      Continue shopping
                    </Link>
                  </div>

                  <div className="divide-y divide-dark-border">
                    {cartRows.map((row) => {
                      const type = row.type || "product";
                      const unitPrice = Number(row.unit_price || 0);
                      const qty = Number(row.quantity || 1);
                      const lineTotal = Number(
                        row.line_total || unitPrice * qty,
                      );

                      //PRODUCTS
                      if (type === "product") {
                        const productId = Number(row.product_id ?? row.id);

                        return (
                          <div
                            key={`p_${productId}`}
                            className="flex gap-6 px-6 py-6 hover:bg-dark-card transition"
                          >
                            {/* Image */}
                            <div
                              className="shrink-0 w-24 rounded-2xl bg-dark-bg border border-dark-border overflow-hidden"
                              style={{ aspectRatio: "1 / 1.4" }}
                            >
                              <img
                                src={row.image_url || row.image}
                                alt={row.name}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-lg truncate">
                                    {row.name}
                                  </h3>
                                  <p className="text-sm text-dark-muted mt-1">
                                    {row.origin || "—"}
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <p className="text-brand font-bold">
                                    £{unitPrice.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-dark-muted mt-1">
                                    each
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 mt-4 flex-wrap">
                                <span
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${roastPill(
                                    row.roast_type || row.roast || "Roast",
                                  )}`}
                                >
                                  {row.roast_type || row.roast || "Roast"}
                                </span>

                                {/* Qty controls */}
                                <div className="ml-auto flex items-center gap-2">
                                  <div className="flex items-center border border-dark-border rounded-xl overflow-hidden bg-dark-bg">
                                    <button
                                      onClick={() => decreaseQty(productId, 1)}
                                      className="px-3 py-2 text-dark-text hover:text-brand transition"
                                      aria-label={`Decrease quantity of ${row.name}`}
                                    >
                                      −
                                    </button>

                                    <span className="px-4 py-2 text-sm font-semibold">
                                      {qty}
                                    </span>

                                    <button
                                      onClick={() => addToCart(productId, 1)}
                                      className="px-3 py-2 text-dark-text hover:text-brand transition"
                                      aria-label={`Increase quantity of ${row.name}`}
                                    >
                                      +
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => removeFromCart(productId)}
                                    className="text-sm text-dark-muted hover:text-brand transition"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>

                              {/* Line total */}
                              <div className="mt-4 text-sm text-dark-muted">
                                Line total:{" "}
                                <span className="text-dark-text font-semibold">
                                  £{lineTotal.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      //CUSTOM BLENDS
                      const cartItemId = row.cart_item_id ?? row.id;

                      const roastLabel = row.roast_name ?? "—";
                      const grindLabel = row.grind_name ?? "—";
                      const sizeLabel = row.size_name ?? "—";

                      const extrasLabels = row.extras_names ?? [];

                      return (
                        <div
                          key={`cb_${cartItemId}`}
                          className="px-6 py-6 hover:bg-dark-card transition"
                        >
                          <div className="rounded-2xl border border-dark-border bg-dark-bg p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-lg truncate">
                                  {row.title || "Build Your Blend"}
                                </h3>
                              </div>

                              <div className="text-right shrink-0">
                                <p className="text-brand font-bold">
                                  £{unitPrice.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            {/* Spec list */}
                            <div className="mt-4 space-y-2">
                              <BlendSpec
                                label="Roast level"
                                value={
                                  <span
                                    className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border ${roastPill(
                                      String(roastLabel),
                                    )}`}
                                  >
                                    {roastLabel}
                                  </span>
                                }
                              />
                              <BlendSpec label="Grind" value={grindLabel} />
                              <BlendSpec label="Size" value={sizeLabel} />
                              <BlendSpec
                                label="Extras"
                                value={
                                  extrasLabels.length
                                    ? extrasLabels.join(", ")
                                    : "None"
                                }
                              />
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                              <span className="text-sm text-dark-muted"></span>

                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() =>
                                    removeCustomBlendFromCart(cartItemId)
                                  }
                                  className="text-sm text-dark-muted hover:text-brand transition"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-6 py-5 border-t border-dark-border flex items-center justify-between">
                    <span className="text-sm text-dark-muted">
                      Tip: Orders over £30 ship free.
                    </span>
                    <span className="text-sm font-semibold text-dark-text">
                      Subtotal: £{subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-28 rounded-3xl border border-dark-border bg-dark-card p-7">
                  <p className="text-xs tracking-[0.25em] uppercase text-dark-muted">
                    Order Summary
                  </p>

                  <div className="mt-6 space-y-4">
                    <Row label="Subtotal" value={`£${subtotal.toFixed(2)}`} />
                    <Row
                      label="Shipping"
                      value={
                        shipping === 0 ? "Free" : `£${shipping.toFixed(2)}`
                      }
                    />
                    <div className="h-px bg-dark-border" />
                    <Row
                      label={<span className="font-semibold">Total</span>}
                      value={
                        <span className="text-brand font-bold text-lg">
                          £{total.toFixed(2)}
                        </span>
                      }
                    />
                  </div>

                  <button
                    disabled={emptyCart || isLoading || isError}
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");
                        if (!token) {
                          navigate("/login");
                          return;
                        }

                        const res = await fetch(
                          `${import.meta.env.VITE_API_BASE}/api/checkout/session`,
                          {
                            method: "POST",
                            headers: {
                              Accept: "application/json",
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(payload),
                          },
                        );

                        const json = await res.json().catch(() => ({}));
                        if (!res.ok) {
                          throw new Error(json?.message || "Checkout failed");
                        }

                        window.location.href = json.url;
                      } catch (err) {
                        console.error(err);
                        alert(
                          err?.message ||
                            "Something went wrong starting checkout.",
                        );
                      }
                    }}
                    className="mt-8 w-full bg-brand text-black py-3 rounded-xl font-semibold hover:bg-brand-hover transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Checkout
                  </button>

                  <div className="mt-6 rounded-2xl border border-dark-border bg-dark-bg p-5">
                    <p className="text-sm font-semibold">Secure checkout</p>
                    <p className="text-sm text-dark-muted mt-2 leading-relaxed">
                      Payments processed securely via Stripe. We never store
                      card details.
                    </p>
                  </div>

                  <p className="text-xs text-dark-muted mt-6 leading-relaxed">
                    By checking out, you agree to RoastLab’s terms and privacy
                    policy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="py-12 text-center border-t border-dark-border">
        <p className="text-dark-muted text-sm">
          © 2026 RoastLab. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function BlendSpec({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs uppercase tracking-[0.2em] text-dark-muted">
        {label}
      </span>
      <div className="text-right">{value}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-dark-muted">{label}</span>
      <span className="text-dark-text">{value}</span>
    </div>
  );
}
