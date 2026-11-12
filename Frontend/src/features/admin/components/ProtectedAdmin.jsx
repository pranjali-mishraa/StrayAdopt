import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function ProtectedAdmin({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-text-mid">Loading...</p>
      </div>
    );
  }

  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}