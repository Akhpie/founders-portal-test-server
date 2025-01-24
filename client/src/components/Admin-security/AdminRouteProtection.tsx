import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = localStorage.getItem("adminToken");

  // Verify token exists and is valid
  if (!token) return <Navigate to="/admin-password" replace />;

  try {
    const decoded = jwtDecode(token) as { admin: boolean; exp: number };

    // Check if token is expired
    if (decoded.exp < Date.now() / 1000) {
      localStorage.removeItem("adminToken");
      return <Navigate to="/admin-password" replace />;
    }

    return <>{children}</>;
  } catch {
    localStorage.removeItem("adminToken");
    return <Navigate to="/admin-password" replace />;
  }
};

export default ProtectedAdminRoute;
