import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check permission
  if (roles.length > 0 && !roles.includes(user.type)) {
    // Duty user trying to access Mandal pages
    if (user.type === "duty") {
      return <Navigate to="/duty" replace />;
    }

    // Mandal users trying to access Duty pages
    if (["admin", "subadmin", "member"].includes(user.type)) {
      return <Navigate to="/dashboard" replace />;
    }

    // Unknown user
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
