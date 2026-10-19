import { createContext, useEffect, useState } from "react";
import { getNgoMe, loginNgo, logoutNgo } from "../services/ngoService";

export const NgoAuthContext = createContext(null);

export function NgoAuthProvider({ children }) {
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNgoMe()
      .then((data) => setNgo(data.ngo))
      .catch(() => setNgo(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const data = await loginNgo(credentials);
    setNgo(data.ngo);
    return data;
  }

  async function logout() {
    try {
      await logoutNgo();
    } finally {
      setNgo(null);
    }
  }

  return (
    <NgoAuthContext.Provider value={{ ngo, loading, login, logout }}>
      {children}
    </NgoAuthContext.Provider>
  );
}