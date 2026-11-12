
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
  
      let accountType = sessionStorage.getItem("activeAccount");
  
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
  
      return () => {
        socket.disconnect();
  
        if (socketRef.current === socket) {
          socketRef.current = null;
        }
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
  