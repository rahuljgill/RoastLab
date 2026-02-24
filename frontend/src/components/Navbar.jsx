import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMe } from "../hooks/useMe";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { useCart } from "../context/CartContext";

function Navbar({ alwaysVisible = false }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const { itemCount } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 5);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${import.meta.env.VITE_API_BASE}/api/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSettled: () => {
      localStorage.removeItem("token");
      queryClient.removeQueries({ queryKey: ["me"] });
      navigate("/");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileOpen(false);
  };

  return (
    <nav
      className={[
        "fixed top-0 left-0 w-full z-50",
        "backdrop-blur-md bg-black/40 border-b border-white/5",
        "transition-all duration-300",
        alwaysVisible || scrolled
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-8",
      ].join(" ")}
    >
      <div className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-dark-text"
        >
          Roast<span className="text-brand">Lab</span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="space-x-6 hidden md:flex text-sm font-medium items-center">
          <Link to="/shop" className="hover:text-brand text-dark-text">
            Shop
          </Link>

          <Link
            to="/build-your-blend"
            className="hover:text-brand text-dark-text"
          >
            Build Blend
          </Link>

          {user ? (
            <>
              <Link to="/my-orders" className="hover:text-brand text-dark-text">
                My Orders
              </Link>

              <button
                onClick={handleLogout}
                className="hover:text-brand text-dark-text"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-brand text-dark-text">
              Login
            </Link>
          )}
        </div>

        {/* RIGHT SIDE*/}
        <div className="flex items-center gap-4">
          <Link
            to="/cart-preview"
            className="relative text-dark-text hover:text-brand transition"
          >
            <FiShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4.5 h-4.5 px-1 rounded-full bg-brand text-black text-[11px] font-bold flex items-center justify-center">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-dark-text"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="pt-3 md:hidden bg-black border-t border-white/10 px-6 pb-6 space-y-4">
          <Link
            to="/shop"
            onClick={() => setMobileOpen(false)}
            className="block text-dark-text hover:text-brand"
          >
            Shop
          </Link>

          <Link
            to="/build-your-blend"
            onClick={() => setMobileOpen(false)}
            className="block text-dark-text hover:text-brand"
          >
            Build Blend
          </Link>

          {user ? (
            <>
              <Link
                to="/my-orders"
                onClick={() => setMobileOpen(false)}
                className="block text-dark-text hover:text-brand"
              >
                My Orders
              </Link>

              <button
                onClick={handleLogout}
                className="block text-dark-text hover:text-brand"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-dark-text hover:text-brand"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
