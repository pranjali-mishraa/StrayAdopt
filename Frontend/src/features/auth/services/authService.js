
import axios from "axios";

const BASE_URL = import.meta.env.PROD
    ? "https://strayadopt.onrender.com"
    : "http://localhost:8000";

// Creates an Axios instance for a specific account type
function createApi(tokenKey) {
    const instance = axios.create({
        baseURL: BASE_URL,
        withCredentials: false,
    });

    instance.interceptors.request.use((config) => {
        const token = sessionStorage.getItem(tokenKey);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });

    return instance;
}

// Separate API instances
export const userApi = createApi("userToken");
export const ngoApi = createApi("ngoToken");

// Default export remains User API for existing User imports
const api = userApi;


// USER AUTH SERVICES

export async function register({ username, email, password }) {
    const response = await userApi.post("/api/auth/register", {
        username,
        email,
        password,
    });

    return response.data;
}

export async function login({ email, password }) {
    const response = await userApi.post("/api/auth/login", {
        email,
        password,
    });

    sessionStorage.setItem("userToken", response.data.token);
    sessionStorage.setItem("activeAccount", "User");

    return response.data;
}

export async function logout() {
    try {
        const response = await userApi.post("/api/auth/logout");
        return response.data;
    } finally {
        sessionStorage.removeItem("userToken");

        if (sessionStorage.getItem("activeAccount") === "User") {
            sessionStorage.removeItem("activeAccount");
        }
    }
}

export async function getMe() {
    const response = await userApi.get("/api/auth/me");
    return response.data;
}

export async function verifyRegistrationOtp({ email, otp }) {
    const response = await userApi.post(
        "/api/auth/verify-registration-otp",
        { email, otp }
    );

    sessionStorage.setItem("userToken", response.data.token);
    sessionStorage.setItem("activeAccount", "User");

    return response.data;
}

export async function resendRegistrationOtp({ email }) {
    const response = await userApi.post(
        "/api/auth/resend-registration-otp",
        { email }
    );

    return response.data;
}

export async function requestPasswordResetOtp({ email }) {
    const response = await userApi.post(
        "/api/auth/forgot-password/request-otp",
        { email }
    );

    return response.data;
}

export async function verifyPasswordResetOtp({ email, otp }) {
    const response = await userApi.post(
        "/api/auth/forgot-password/verify-otp",
        { email, otp }
    );

    return response.data;
}

export async function resetPassword({ resetToken, newPassword }) {
    const response = await userApi.post(
        "/api/auth/forgot-password/reset",
        { resetToken, newPassword }
    );

    return response.data;
}

export default api;
