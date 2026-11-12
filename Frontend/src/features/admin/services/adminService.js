
import axios from "axios";

const BASE_URL = import.meta.env.PROD
  ? "https://strayadopt.onrender.com"
  : "http://localhost:8000";

// Independent Admin API instance
const adminApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// Attach Admin token to protected requests
adminApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Admin authentication
export async function loginAdmin({ email, password }) {
  const response = await adminApi.post("/api/admin/login", {
    email,
    password,
  });

  sessionStorage.setItem("adminToken", response.data.token);
  sessionStorage.setItem("activeAccount", "Admin");

  return response.data;
}

export async function logoutAdmin() {
  try {
    const response = await adminApi.post("/api/admin/logout");
    return response.data;
  } finally {
    sessionStorage.removeItem("adminToken");

    if (sessionStorage.getItem("activeAccount") === "Admin") {
      sessionStorage.removeItem("activeAccount");
    }
  }
}

export async function getAdminMe() {
  const response = await adminApi.get("/api/admin/me");
  return response.data;
}

// NGO management
export async function listNgos(status = "pending") {
  const response = await adminApi.get("/api/admin/ngos", {
    params: { status },
  });
  return response.data;
}

export async function getNgoForReview(id) {
  const response = await adminApi.get(`/api/admin/ngos/${id}`);
  return response.data;
}

export async function approveNgo(id) {
  const response = await adminApi.patch(`/api/admin/ngos/${id}/approve`);
  return response.data;
}

export async function rejectNgo(id, reason) {
  const response = await adminApi.patch(
    `/api/admin/ngos/${id}/reject`,
    { reason }
  );
  return response.data;
}
