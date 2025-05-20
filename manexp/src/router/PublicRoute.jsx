import { Navigate, Outlet } from "react-router-dom";
import tokenMethod from "../api/token";

const PublicRoute = () => {
  const isAuthenticated = tokenMethod.getToken();
  return isAuthenticated ? <Navigate to="/homepage" replace /> : <Outlet />;
};

export default PublicRoute;
