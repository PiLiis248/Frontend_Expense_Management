// PrivateRoute.js
import { Navigate, Outlet } from "react-router-dom";
import tokenMethod from "../api/token";
import PATHS from "../constants/path";

const PrivateRoute = () => {
  const isAuthenticated = tokenMethod.getToken();
  // Private routes are accessible only when authenticated
  // If not authenticated, redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to={PATHS.login} replace />;
};

export default PrivateRoute;