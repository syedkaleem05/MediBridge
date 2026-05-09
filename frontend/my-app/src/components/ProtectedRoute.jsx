import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/useAuth.js";

export function ProtectedRoute({ children, requireRole }) {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (requireRole && user?.role !== requireRole)
    return <Navigate to="/" replace />;
  return children;
}

