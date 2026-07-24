import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

export async function register({ username, email, password }) {
  const response = await api.post("/api/auth/register", { username, email, password });
  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
}

export async function logout() {
  const response = await api.post("/api/auth/logout");
  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/auth/me");
  return response.data;
}

export default api ; 