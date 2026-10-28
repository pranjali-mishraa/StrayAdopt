import { createContext, useContext, useEffect, useState } from "react";
import { getAdminMe, loginAdmin, logoutAdmin } from "../services/adminService";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminMe()
      .then((data) => setAdmin(data.admin))
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const data = await loginAdmin(credentials);
    setAdmin(data.admin);
    return data;
  }

  async function logout() {
    try {
      await logoutAdmin();
    } finally {
      setAdmin(null);
    }
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);