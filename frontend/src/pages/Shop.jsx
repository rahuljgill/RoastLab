import Navbar from "../components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const roastStyle = (roast) => {
  const r = (roast || "").toLowerCase();
  if (r.includes("light") && !r.includes("medium"))
    return "border-sky-400/50 text-sky-300 bg-sky-400/10";
  if (r.includes("dark") && !r.includes("medium"))
    return "border-orange-900/60 text-orange-300 bg-orange-900/20";
  if (r.includes("decaf"))
    return "border-purple-400/40 text-purple-300 bg-purple-400/10";
  return "border-amber-500/40 text-amber-300 bg-amber-500/10";
};

export default function Shop() {
  const { addToCart } = useCart();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/products`, {
        headers: {
          Accept: "application/json",
        },
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || "Failed to load products.");
      }

      return json;
    },
  });

  const products = data?.products || [];

  return (
    <div className="bg-dark-bg text-dark-text min-h-screen font-(--font-body)">
      <Navbar alwaysVisible />

      <div className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-14">
            <p className="text-xs tracking-[0.25em] uppercase text-dark-muted">
              Browse
            </p>

            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
              Shop
            </h1>
            <p className="text-dark-muted mt-3 max-w-xl leading-relaxed">
              Single-origin roasts and house blends, sourced carefully and
              roasted in small batches, ready to ship fresh to your door.
            </p>
          </div>

          {/* TOP DIVIDER */}
          <div className="border-t border-dark-border" />

          {isLoading && (
            <div className="py-16 text-dark-muted">Loading products...</div>
          )}

          {isError && (
            <div className="py-16 text-dark-muted">
              <span className="text-brand font-semibold">Error:</span>{" "}
              {error?.message || "Something went wrong."}
            </div>
          )}

          {!isLoading && !isError && (
            <div className="flex flex-col">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="group relative flex flex-row items-stretch border-b border-dark-border hover:bg-dark-card transition-colors duration-300"
                >
                  {/* Hover accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-brand scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center rounded-full" />

                  {/* Blend index */}
                  <div className="shrink-0 w-28 flex flex-col items-center justify-center py-8 border-r border-dark-border">
                    <span className="text-xs font-mono text-dark-muted group-hover:text-brand transition-colors duration-300 tracking-widest uppercase">
                      blend
                    </span>
                    <span className="text-3xl font-bold font-mono text-dark-muted group-hover:text-brand transition-colors duration-300 leading-none mt-1">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Main content */}
                  <div className="flex flex-col flex-1 py-8 px-8 gap-4 justify-center">
                    <div className="flex items-baseline gap-4 flex-wrap">
                      <h3 className="font-semibold text-2xl group-hover:text-brand transition-colors duration-300">
                        {product.name}
                      </h3>
                      <span className="text-dark-muted text-base">
                        {product.origin || "—"}
                      </span>
                    </div>

                    <p className="text-dark-muted text-base leading-relaxed max-w-lg">
                      {product.description || ""}
                    </p>

                    <div className="flex items-center gap-5 flex-wrap mt-1">
                      <span
                        className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${roastStyle(
                          product.roast_type,
                        )}`}
                      >
                        {product.roast_type || "Roast"}
                      </span>

                      <span className="text-brand font-bold text-xl">
                        £{Number(product.price).toFixed(2)}
                      </span>

                      <div className="ml-auto">
                        <button
                          onClick={() => addToCart(product.id)}
                          className="bg-brand text-black px-7 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-hover transition"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  <div
                    className="shrink-0 w-48 self-center mr-8 rounded-2xl overflow-hidden bg-dark-surface"
                    style={{ aspectRatio: "1 / 2" }}
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.06]"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}

              {products.length === 0 && (
                <div className="py-16 text-dark-muted">No products found.</div>
              )}
            </div>
          )}

          <div className="mt-16 bg-dark-card border border-dark-border rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Want something custom?</h2>
              <p className="text-dark-muted mt-2 max-w-2xl leading-relaxed">
                Build your own blend by choosing roast level, grind type, size
                and extras.
              </p>
            </div>
            <Link
              to="/build-your-blend"
              className="bg-brand text-black px-6 py-3 rounded-lg font-semibold hover:bg-brand-hover transition whitespace-nowrap"
            >
              Build Your Blend
            </Link>
          </div>
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
