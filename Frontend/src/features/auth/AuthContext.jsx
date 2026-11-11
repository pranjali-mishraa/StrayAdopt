
import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const token = sessionStorage.getItem("userToken");

            // No User session in this tab
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const data = await getMe();
                setUser(data.user);
            } catch (err) {
                if (err.response?.status === 401) {
                    sessionStorage.removeItem("userToken");
                    setUser(null);
                } else {
                    console.error("User session restoration failed:", err);
                }
            } finally {
                setLoading(false);
            }
        }

        init();
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, setUser, loading, setLoading }}
        >
            {children}
        </AuthContext.Provider>
    );
};
