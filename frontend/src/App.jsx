import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import MyOrders from "./pages/MyOrders";
import BuildYourBlend from "./pages/BuildYourBlend";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/cart-preview" element={<Cart />} />
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/build-your-blend" element={<BuildYourBlend />} />
    </Routes>
  );
}
