import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMe } from "../hooks/useMe";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || "";
  }
}

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

function BlendSpec({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs uppercase tracking-[0.2em] text-dark-muted">
        {label}
      </span>
      <div className="text-right text-sm">{value}</div>
    </div>
  );
}

export default function MyOrders() {
  const { data: me, isLoading: meLoading, isError: meError } = useMe();
  const token = localStorage.getItem("token");

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErrObj,
  } = useQuery({
    queryKey: ["orders"],
    enabled: !!token && !!me,
    retry: false,
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to load orders.");
      return json;
    },
  });

  const orders = ordersData?.orders ?? [];

  return (
    <div className="bg-dark-bg text-dark-text min-h-screen font-(--font-body)">
      <Navbar alwaysVisible />

      <div className="pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs tracking-[0.25em] uppercase text-dark-muted">
              Account
            </p>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
              My{" "}
              <span className="bg-linear-to-r from-brand to-brand-hover bg-clip-text text-transparent">
                Orders
              </span>
            </h1>
            <p className="text-dark-muted mt-3 max-w-2xl leading-relaxed">
              View your past orders and their items.
            </p>
          </div>

          {/* Auth state */}
          {meLoading && (
            <div className="py-10 text-dark-muted">Loading your account...</div>
          )}

          {!meLoading && (meError || !token) && (
            <div className="rounded-3xl border border-dark-border bg-dark-surface px-6 py-16 text-center">
              <p className="text-dark-muted">
                You need to be logged in to view your orders.
              </p>
              <Link
                to="/login"
                className="inline-block mt-6 bg-brand text-black px-6 py-3 rounded-xl font-semibold hover:bg-brand-hover transition"
              >
                Go to Login
              </Link>
            </div>
          )}

          {/* Orders loading/error */}
          {!!me && ordersLoading && (
            <div className="py-10 text-dark-muted">Loading orders...</div>
          )}

          {!!me && ordersError && (
            <div className="py-10 text-dark-muted">
              <span className="text-brand font-semibold">Error:</span>{" "}
              {ordersErrObj?.message || "Something went wrong."}
            </div>
          )}

          {/* Orders list */}
          {!!me && !ordersLoading && !ordersError && (
            <>
              {orders.length === 0 ? (
                <div className="rounded-3xl border border-dark-border bg-dark-surface px-6 py-16 text-center">
                  <p className="text-dark-muted">
                    You don’t have any orders yet.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block mt-6 bg-brand text-black px-6 py-3 rounded-xl font-semibold hover:bg-brand-hover transition"
                  >
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-3xl border border-dark-border bg-dark-surface overflow-hidden"
                    >
                      {/* Order header */}
                      <div className="px-6 py-5 border-b border-dark-border flex flex-wrap items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            Order ID #{order.id}
                          </p>
                          <p className="text-xs text-dark-muted mt-1">
                            Placed: {formatDate(order.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-500/40 text-amber-300 bg-amber-500/10">
                            {order.status || "—"}
                          </span>

                          <p className="text-brand font-bold">
                            £{Number(order.total_amount || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="px-6 py-5">
                        <p className="text-xs tracking-[0.25em] uppercase text-dark-muted">
                          Items
                        </p>

                        <div className="mt-4 divide-y divide-dark-border">
                          {(order.items || []).map((item) => {
                            const type =
                              item?.type ||
                              (item?.custom_blend ? "custom_blend" : "product");
                            const qty = Number(item?.quantity || 1);
                            const unit = Number(
                              item?.price || item?.unit_price || 0,
                            );
                            const lineTotal = qty * unit;

                            if (type === "product") {
                              const name =
                                item?.product?.name ||
                                item?.name ||
                                `Product #${item.product_id}`;

                              return (
                                <div
                                  key={
                                    item.id ??
                                    `${order.id}-p-${item.product_id}`
                                  }
                                  className="py-4 flex items-start justify-between gap-4"
                                >
                                  <div className="min-w-0">
                                    <p className="font-semibold truncate">
                                      {name}
                                    </p>
                                    <p className="text-sm text-dark-muted mt-1">
                                      Qty: {qty} • Unit: £{unit.toFixed(2)}
                                    </p>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <p className="font-semibold">
                                      £{lineTotal.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              );
                            }

                            const custom_blend = item?.custom_blend || {};
                            const roast =
                              custom_blend?.roast ??
                              custom_blend?.roast_name ??
                              "—";
                            const grind =
                              custom_blend?.grind ??
                              custom_blend?.grind_name ??
                              "—";
                            const size =
                              custom_blend?.size ??
                              custom_blend?.size_name ??
                              "—";
                            const extras = Array.isArray(custom_blend?.extras)
                              ? custom_blend.extras
                              : [];

                            return (
                              <div
                                key={
                                  item.id ??
                                  `${order.id}-cb-${custom_blend?.cart_item_id ?? "x"}`
                                }
                                className="py-4"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <p className="font-semibold truncate">
                                      Custom Blend
                                    </p>
                                    <p className="text-sm text-dark-muted mt-1">
                                      Qty: {qty} • Unit: £{unit.toFixed(2)}
                                    </p>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <p className="font-semibold">
                                      £{lineTotal.toFixed(2)}
                                    </p>
                                  </div>
                                </div>

                                {/* Specs */}
                                <div className="mt-4 rounded-2xl border border-dark-border bg-dark-bg p-4 space-y-2">
                                  <BlendSpec
                                    label="Roast"
                                    value={
                                      <span
                                        className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border ${roastPill(
                                          String(roast),
                                        )}`}
                                      >
                                        {roast}
                                      </span>
                                    }
                                  />
                                  <BlendSpec label="Grind" value={grind} />
                                  <BlendSpec label="Size" value={size} />
                                  <BlendSpec
                                    label="Extras"
                                    value={
                                      extras.length ? extras.join(", ") : "None"
                                    }
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
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
