
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  return sessionStorage.getItem("user__id") ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
