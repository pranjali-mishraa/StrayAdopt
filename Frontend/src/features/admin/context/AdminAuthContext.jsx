
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getAdminMe,
  loginAdmin,
  logoutAdmin,
} from "../services/adminService";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore Admin session after refresh
  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    getAdminMe()
      .then((data) => {
        setAdmin(data.admin);
      })
      .catch((error) => {
        if (error?.response?.status === 401) {
          sessionStorage.removeItem("adminToken");
          if (sessionStorage.getItem("activeAccount") === "Admin") {
            sessionStorage.removeItem("activeAccount");
          }
        }

        setAdmin(null);
      })
      .finally(() => {
        setLoading(false);
      });
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
      sessionStorage.removeItem("adminToken");
      setAdmin(null);
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{ admin, loading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
