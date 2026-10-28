import { RouterProvider } from "react-router-dom";
import { router } from "./app.routes.jsx";
import { AuthProvider } from "./features/auth/AuthContext";
import { SocketProvider } from "./features/chat/SocketContext";
import { NgoAuthProvider } from "./features/ngo/context/NgoAuthContext";

function App() {
  return (
    <AuthProvider>
      <NgoAuthProvider>
        <SocketProvider>
          <RouterProvider router={router} />
        </SocketProvider>
      </NgoAuthProvider>
    </AuthProvider>
  );
}

export default App;