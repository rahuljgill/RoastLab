import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function CheckoutSuccess() {
  return (
    <div className="bg-dark-bg text-dark-text min-h-screen font-(--font-body)">
      <Navbar alwaysVisible />

      <div className="pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-dark-border bg-dark-surface px-8 py-12 text-center">
            <p className="text-xs tracking-[0.25em] uppercase text-dark-muted">
              Payment successful
            </p>

            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Order confirmed
            </h1>

            <p className="text-dark-muted mt-4 leading-relaxed">
              Thanks for your purchase. We’re processing your order now.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to="/shop"
                className="bg-brand text-black px-6 py-3 rounded-xl font-semibold hover:bg-brand-hover transition"
              >
                Continue shopping
              </Link>

              <Link
                to="/cart-preview"
                className="px-6 py-3 rounded-xl font-semibold border border-dark-border hover:bg-dark-card transition"
              >
                Back to cart
              </Link>
            </div>
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
