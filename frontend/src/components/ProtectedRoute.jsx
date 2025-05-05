// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");  // Check if token exists

  if (!token) {
    return <Navigate to="/login" />;  // Redirect to login if not authenticated
  }

  return children;  // Show the protected page if token exists
};

export default ProtectedRoute;
