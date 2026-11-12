
import { ngoApi as api } from "../../auth/services/authService";

const multipart = {
    headers: { "Content-Type": "multipart/form-data" }
};

// REGISTER NGO
export async function registerNgo(formData) {
    const response = await api.post(
        "/api/ngo/register",
        formData,
        multipart
    );

    return response.data;
}

// NGO LOGIN
export async function loginNgo({ email, password }) {
    const response = await api.post("/api/ngo/login", {
        email,
        password
    });

    sessionStorage.setItem("ngoToken", response.data.token);
    sessionStorage.setItem("activeAccount", "Ngo");

    return response.data;
}

// NGO LOGOUT
export async function logoutNgo() {
    try {
        const response = await api.post("/api/ngo/logout");
        return response.data;
    } finally {
        sessionStorage.removeItem("ngoToken");

        if (sessionStorage.getItem("activeAccount") === "Ngo") {
            sessionStorage.removeItem("activeAccount");
        }
    }
}

// GET NGO PROFILE (AUTHENTICATED)
export async function getNgoMe() {
    const response = await api.get("/api/ngo/me");
    return response.data;
}

// NGO POSTS
export async function getMyNgoPosts() {
    const response = await api.get("/api/ngo/posts/mine");
    return response.data;
}

export async function createNgoPost(formData) {
    const response = await api.post(
        "/api/ngo/posts",
        formData,
        multipart
    );

    return response.data;
}

// NGO HIGHLIGHTS
export async function createHighlight(formData) {
    const response = await api.post(
        "/api/ngo/highlights",
        formData,
        multipart
    );

    return response.data;
}

// PUBLIC NGO ENDPOINTS
export async function getNgoProfile(id) {
    const response = await api.get(`/api/ngo/${id}`);
    return response.data;
}

export async function getNgoPosts(id, page = 1, limit = 12) {
    const response = await api.get(
        `/api/ngo/${id}/posts?page=${page}&limit=${limit}`
    );

    return response.data;
}

export async function getNgoHighlights(id) {
    const response = await api.get(`/api/ngo/${id}/highlights`);
    return response.data;
}

// NGO POST MANAGEMENT
export async function toggleNgoPostStatus(id) {
    const response = await api.patch(`/api/ngo/posts/${id}/status`);
    return response.data;
}

export async function deleteNgoPost(id) {
    const response = await api.delete(`/api/ngo/posts/${id}`);
    return response.data;
}
