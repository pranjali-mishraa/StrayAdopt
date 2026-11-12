
import { RouterProvider } from "react-router-dom";
import { router } from "./app.routes.jsx";

import { AuthProvider } from "./features/auth/AuthContext";
import { NgoAuthProvider } from "./features/ngo/context/NgoAuthContext";
import { AdminAuthProvider } from "./features/admin/context/AdminAuthContext";
import { SocketProvider } from "./features/chat/SocketContext";

function App() {
  return (
    <AuthProvider>
      <NgoAuthProvider>
        <AdminAuthProvider>
          <SocketProvider>
            <RouterProvider router={router} />
          </SocketProvider>
        </AdminAuthProvider>
      </NgoAuthProvider>
    </AuthProvider>
  );
}

export default App;
