
import { Navigate } from "react-router-dom";

const ProtectedStaffRoute = ({ children }) => {
  return sessionStorage.getItem("staff__id") ? children : <Navigate to="/" />;

};
export default ProtectedStaffRoute;
