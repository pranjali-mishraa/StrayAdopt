
import { Navigate } from "react-router-dom";
import { useNgoAuth } from "../hooks/useNgoAuth";

export default function ProtectedNgo({ children }) {
    const { ngo, loading } = useNgoAuth();

    const activeAccount = sessionStorage.getItem("activeAccount");

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream">
                <p className="text-text-mid">Loading...</p>
            </div>
        );
    }

    // NGO must be authenticated and active in this tab
    if (!ngo || activeAccount !== "Ngo") {
        if (activeAccount === "User") {
            return <Navigate to="/" replace />;
        }

        return <Navigate to="/ngo/login" replace />;
    }

    return children;
}
