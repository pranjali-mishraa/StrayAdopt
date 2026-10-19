import { Navigate } from "react-router-dom";
import { useNgoAuth } from "../hooks/useNgoAuth";

export default function ProtectedNgo({ children }) {
  const { ngo, loading } = useNgoAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-text-mid">Loading...</p>
      </div>
    );
  }

  if (!ngo) return <Navigate to="/ngo/login" replace />;
  return children;
}