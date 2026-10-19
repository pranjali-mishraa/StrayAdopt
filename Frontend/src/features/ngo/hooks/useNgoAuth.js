import { useContext } from "react";
import { NgoAuthContext } from "../context/NgoAuthContext";

export const useNgoAuth = () => useContext(NgoAuthContext);