import api from "../../auth/services/authService";

export async function loginAdmin({ email, password }) {
  return (await api.post("/api/admin/login", { email, password })).data;
}

export async function logoutAdmin() {
  return (await api.post("/api/admin/logout")).data;
}

export async function getAdminMe() {
  return (await api.get("/api/admin/me")).data;
}

export async function listNgos(status = "pending") {
  return (await api.get(`/api/admin/ngos?status=${status}`)).data;
}

export async function getNgoForReview(id) {
  return (await api.get(`/api/admin/ngos/${id}`)).data;
}

export async function approveNgo(id) {
  return (await api.patch(`/api/admin/ngos/${id}/approve`)).data;
}

export async function rejectNgo(id, reason) {
  return (await api.patch(`/api/admin/ngos/${id}/reject`, { reason })).data;
}