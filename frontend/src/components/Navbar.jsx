import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMe } from "../hooks/useMe";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";

function Navbar({ alwaysVisible = false }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 5);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        await res.json().catch(() => ({}));
      }
    },
    onSettled: () => {
      localStorage.removeItem("token");
      queryClient.removeQueries({ queryKey: ["me"] });
      navigate("/");
    },
  });

  const handleLogout = () => logoutMutation.mutate();

  return (
    <nav
      className={[
        "navbar fixed top-0 left-0 w-full z-50",
        "backdrop-blur-md bg-black/40 border-b border-white/5",
        "transition-all duration-300",
        alwaysVisible || scrolled
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-8",
      ].join(" ")}
    >
      <div className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-dark-text"
        >
          Roast<span className="text-brand">Lab</span>
        </Link>

        <div className="space-x-6 hidden md:flex text-sm font-medium items-center">
          <Link
            to="/shop"
            className="hover:text-brand transition text-dark-text"
          >
            Shop
          </Link>

          {user ? (
            <>
              <Link
                to="/my-orders"
                className="hover:text-brand transition text-dark-text"
              >
                My Orders
              </Link>

              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="hover:text-brand transition text-dark-text disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-brand transition text-dark-text"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hover:text-brand transition text-dark-text"
              >
                Register
              </Link>
            </>
          )}

          {/* Cart icon + badge */}
          <Link
            to="/cart-preview"
            className="relative text-dark-text hover:text-brand transition-colors duration-200"
            aria-label="Shopping cart"
          >
            <FiShoppingCart size={20} />

            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4.5 h-4.5 px-1 rounded-full bg-brand text-black text-[11px] font-bold flex items-center justify-center">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
