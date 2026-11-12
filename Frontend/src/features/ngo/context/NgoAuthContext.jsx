
import { createContext, useEffect, useState } from "react";
import {
    getNgoMe,
    loginNgo,
    logoutNgo,
} from "../services/ngoService";

export const NgoAuthContext = createContext(null);

export function NgoAuthProvider({ children }) {
    const [ngo, setNgo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore NGO session for this tab
    useEffect(() => {
        async function init() {
            const token = sessionStorage.getItem("ngoToken");

            if (!token) {
                setNgo(null);
                setLoading(false);
                return;
            }

            try {
                const data = await getNgoMe();
                setNgo(data.ngo);
            } catch (error) {
                if (error.response?.status === 401) {
                    sessionStorage.removeItem("ngoToken");
                    setNgo(null);
                } else {
                    console.error("NGO session restoration failed:", error);
                }
            } finally {
                setLoading(false);
            }
        }

        init();
    }, []);

    // NGO LOGIN
    async function login(credentials) {
        const data = await loginNgo(credentials);

        // Token must be stored by ngoService.js
        setNgo(data.ngo);

        return data;
    }

    // NGO LOGOUT
    async function logout() {
        try {
            await logoutNgo();
        } catch (error) {
            console.error("NGO logout API failed:", error);
        } finally {
            sessionStorage.removeItem("ngoToken");
            setNgo(null);
        }
    }

    return (
        <NgoAuthContext.Provider
            value={{ ngo, setNgo, loading, login, logout }}
        >
            {children}
        </NgoAuthContext.Provider>
    );
}
