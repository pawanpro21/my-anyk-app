import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  const storedUser = sessionStorage.getItem("auth_user");

  if (!storedUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  try {
    const user = JSON.parse(storedUser);
    const role = String(user?.role || "").trim().toLowerCase();

    if (requireAdmin && role !== "admin") {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch {
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
}
