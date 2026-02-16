import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import { APP_ROUTES, PUBLIC_ONLY_ROUTES } from "../../routes/paths";
import RouteLoader from "../RouteLoader";

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoader />;
  }

  if (isAuthenticated && PUBLIC_ONLY_ROUTES.has(location.pathname)) {
    return <Navigate to={APP_ROUTES.DASHBOARD} replace />;
  }

  return children;
}
