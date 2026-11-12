import { Outlet } from "react-router-dom";
import { AdminAuthProvider } from "../context/AdminAuthContext";

export default function AdminLayout() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}