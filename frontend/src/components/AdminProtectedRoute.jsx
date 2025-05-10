import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    // Redirect to admin login if no admin token
    return <Navigate to="/admin/login" />;
  }

  return children;
};

export default AdminProtectedRoute; 