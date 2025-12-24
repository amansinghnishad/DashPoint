import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "./AuthContext";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // For login and register pages, redirect to dashboard if authenticated
  if (
    isAuthenticated &&
    (window.location.pathname === "/login" ||
      window.location.pathname === "/register" ||
      window.location.pathname === "/")
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
