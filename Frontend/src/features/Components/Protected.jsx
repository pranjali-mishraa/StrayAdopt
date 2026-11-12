
import { Navigate } from "react-router-dom";
import { useAuthService } from "../auth/hooks/useAuthService";

export default function Protected({ children }) {
    const { user, loading } = useAuthService();

    const activeAccount = sessionStorage.getItem("activeAccount");

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream">
                <p className="text-text-mid">Loading...</p>
            </div>
        );
    }

    // User must be authenticated and active in this tab
    if (!user || activeAccount !== "User") {
        if (activeAccount === "Ngo") {
            return <Navigate to="/ngo/dashboard" replace />;
        }

        return <Navigate to="/login" replace />;
    }

    return children;
}
