import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import MyOrders from "./pages/MyOrders";
import BuildYourBlend from "./pages/BuildYourBlend";

import { ProtectedRoute, GuestRoute } from "./components/RouteGuards";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* guest only */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      <Route path="/shop" element={<Shop />} />
      <Route path="/cart-preview" element={<Cart />} />
      <Route path="/build-your-blend" element={<BuildYourBlend />} />

      {/* protected */}
      <Route
        path="/checkout/success"
        element={
          <ProtectedRoute>
            <CheckoutSuccess />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-orders"
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
