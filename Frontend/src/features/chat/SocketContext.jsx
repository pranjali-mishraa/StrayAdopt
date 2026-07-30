import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../auth/AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export function SocketProvider({ children }) {
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("error_event");

      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

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