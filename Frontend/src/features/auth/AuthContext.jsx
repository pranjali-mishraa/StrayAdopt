import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const data = await getMe();
        setUser(data.user);
      } catch (err) {
        if (err.response?.status === 401) {
          setUser(null);
        } else {
          console.error(err);
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