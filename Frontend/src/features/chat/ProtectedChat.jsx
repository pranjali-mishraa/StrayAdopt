
import { Navigate } from "react-router-dom";
import { useAuthService } from "../auth/hooks/useAuthService";
import { useNgoAuth } from "../ngo/hooks/useNgoAuth";

export default function ProtectedChat({ children }) {
    const { user, loading: userLoading } = useAuthService();
    const { ngo, loading: ngoLoading } = useNgoAuth();

    const activeAccount = sessionStorage.getItem("activeAccount");

    if (userLoading || ngoLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream">
                <p className="text-text-mid">Loading...</p>
            </div>
        );
    }

    const isUserActive = activeAccount === "User" && !!user;
    const isNgoActive = activeAccount === "Ngo" && !!ngo;

    if (!isUserActive && !isNgoActive) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
