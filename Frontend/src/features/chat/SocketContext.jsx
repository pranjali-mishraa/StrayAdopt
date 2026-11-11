
import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
      const userToken = sessionStorage.getItem("userToken");
      const ngoToken = sessionStorage.getItem("ngoToken");

      // Determine which account is active in this tab
      let accountType = sessionStorage.getItem("activeAccount");

      // Fallback when exactly one account token exists
      if (!accountType) {
          if (userToken && !ngoToken) accountType = "User";
          else if (ngoToken && !userToken) accountType = "Ngo";
      }

      const token =
          accountType === "User"
              ? userToken
              : accountType === "Ngo"
                  ? ngoToken
                  : null;

      if (!token) {
          socketRef.current?.disconnect();
          socketRef.current = null;
          return;
      }

      const socket = io(SOCKET_URL, {
          withCredentials: false,
          autoConnect: true,
          transports: ["websocket", "polling"],
          auth: {
              token,
              accountType,
          },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
          console.log(`Chat connected as ${accountType}`);
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
