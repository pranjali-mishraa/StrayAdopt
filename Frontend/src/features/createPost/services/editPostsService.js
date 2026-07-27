import api from "../../auth/services/authService";

export async function updateDescription(id, description) {
    const response = await api.patch(`/api/posts/${id}/description`, { description });
    return response.data;
}

export async function updateLocation(id, location) {
    const response = await api.patch(`/api/posts/${id}/location`, { location });
    return response.data;
}

export async function updateImages(id, formData) {
    const response = await api.patch(`/api/posts/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
}

export async function toggleAdoptedStatus(id) {
    const response = await api.patch(`/api/posts/${id}/status`);
    return response.data;
}

export async function deletePost(id) {
    const response = await api.delete(`/api/posts/${id}`);
    return response.data;
}