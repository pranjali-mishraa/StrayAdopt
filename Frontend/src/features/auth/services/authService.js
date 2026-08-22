import axios from "axios";

const api = axios.create({
  baseURL: "https://strayadopt.onrender.com",
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

export async function verifyRegistrationOtp({ email, otp }) {
  const response = await api.post("/api/auth/verify-registration-otp", { email, otp });
  return response.data;
}

export async function resendRegistrationOtp({ email }) {
  const response = await api.post("/api/auth/resend-registration-otp", { email });
  return response.data;
}

export async function requestPasswordResetOtp({ email }) {
  const response = await api.post("/api/auth/forgot-password/request-otp", { email });
  return response.data;
}

export async function verifyPasswordResetOtp({ email, otp }) {
  const response = await api.post("/api/auth/forgot-password/verify-otp", { email, otp });
  return response.data;
}

export async function resetPassword({ resetToken, newPassword }) {
  const response = await api.post("/api/auth/forgot-password/reset", { resetToken, newPassword });
  return response.data;
}

export default api ; 