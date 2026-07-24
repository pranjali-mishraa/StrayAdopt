import api from "../../auth/services/authService";

/**
 * Create a new post
 */
export async function createPost(formData) {
    const response = await api.post("/api/posts/create", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
}

/**
 * Get latest posts for Home page
 */
export async function getLatestPosts() {
    const response = await api.get("/api/posts/latest");

    return response.data;
}

/**
 * Get all posts for Explore page
 */
export async function getAllPosts(page = 1, limit = 12) {
    const response = await api.get(
        `/api/posts/allPosts?page=${page}&limit=${limit}`
    );

    return response.data;
}

