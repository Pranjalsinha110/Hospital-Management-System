import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const location = useLocation();

  // Apne login ke time jis key mein token save karte ho,
  // yahan wahi key use karo.
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Please login to book an appointment.",
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;