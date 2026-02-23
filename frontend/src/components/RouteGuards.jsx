import { Navigate } from "react-router-dom";
import { useMe } from "../hooks/useMe";

export function ProtectedRoute({ children }) {
  const { data: me, isLoading } = useMe();

  if (isLoading) return null;

  if (!me) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { data: me, isLoading } = useMe();

  if (isLoading) return null;

  if (me) {
    return <Navigate to="/" replace />;
  }

  return children;
}
