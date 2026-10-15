import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function ragSearch(query, sessionId) {
  const response = await api.post("/api/rag-search", { query, sessionId });
  return response.data;
}

export async function getRagHistory(sessionId) {
  const response = await api.get(`/api/rag-search/history/${sessionId}`);
  return response.data;
}

export async function clearRagHistory(sessionId) {
  const response = await api.delete(`/api/rag-search/history/${sessionId}`);
  return response.data;
}
