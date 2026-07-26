import { Navigate } from "react-router-dom";
import { useAuthService } from "../auth/hooks/useAuthService"; 

export default function Protected({ children }) {
  const { user, loading } = useAuthService();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-text-mid">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}