import api from "../../auth/services/authService";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export async function registerNgo(formData) {
  const response = await api.post("/api/ngo/register", formData, multipart);
  return response.data;
}

export async function loginNgo({ email, password }) {
  const response = await api.post("/api/ngo/login", { email, password });
  return response.data;
}

export async function logoutNgo() {
  const response = await api.post("/api/ngo/logout");
  return response.data;
}

export async function getNgoMe() {
  const response = await api.get("/api/ngo/me");
  return response.data;
}

export async function getMyNgoPosts() {
  const response = await api.get("/api/ngo/posts/mine");
  return response.data;
}

export async function createNgoPost(formData) {
  const response = await api.post("/api/ngo/posts", formData, multipart);
  return response.data;
}

export async function createHighlight(formData) {
  const response = await api.post("/api/ngo/highlights", formData, multipart);
  return response.data;
}

// Public
export async function getNgoProfile(id) {
  const response = await api.get(`/api/ngo/${id}`);
  return response.data;
}

export async function getNgoPosts(id, page = 1, limit = 12) {
  const response = await api.get(`/api/ngo/${id}/posts?page=${page}&limit=${limit}`);
  return response.data;
}

export async function getNgoHighlights(id) {
  const response = await api.get(`/api/ngo/${id}/highlights`);
  return response.data;
}