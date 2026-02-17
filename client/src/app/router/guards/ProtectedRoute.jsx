import { Navigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import { APP_ROUTES } from "../../routes/paths";
import RouteLoader from "../RouteLoader";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <RouteLoader />;
  }

  return isAuthenticated ? children : <Navigate to={APP_ROUTES.LOGIN} replace />;
}
