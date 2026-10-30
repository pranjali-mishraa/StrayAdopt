
import {
  createContext,
  useContext,
  useEffect,
  useRef
} from "react";

import { io } from "socket.io-client";

import { AuthContext } from "../auth/AuthContext";
import { NgoAuthContext } from "../ngo/context/NgoAuthContext";

const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export function SocketProvider({ children }) {
  const { user } = useContext(AuthContext);
  const { ngo } = useContext(NgoAuthContext);

  const socketRef = useRef(null);

  useEffect(() => {
    // Disconnect if no account is logged in
    if (!user && !ngo) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    // Do not allow simultaneous account sessions
    if (user && ngo) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      console.error("Multiple account sessions detected");
      return;
    }

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Chat socket connected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };

  }, [user?._id, ngo?._id]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const socketRef = useContext(SocketContext);

  if (!socketRef) {
    throw new Error("useSocket must be used inside SocketProvider");
  }

  return socketRef;
}
