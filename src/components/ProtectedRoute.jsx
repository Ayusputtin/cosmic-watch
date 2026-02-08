import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const AUTH_KEY = "cosmicwatch_isAuthenticated";
const ROLE_KEY = "cosmicwatch_userRole";

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem(AUTH_KEY) === "true";
  const role = localStorage.getItem(ROLE_KEY);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}
