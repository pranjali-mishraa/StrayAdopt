
import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

const conversationAPI = axios.create({
    baseURL: `${API_URL}/api/conversations`,
    withCredentials: false,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach the token belonging to the active account in this tab
conversationAPI.interceptors.request.use((config) => {
    const activeAccount = sessionStorage.getItem("activeAccount");

    let token = null;

    if (activeAccount === "User") {
        token = sessionStorage.getItem("userToken");
    } else if (activeAccount === "Ngo") {
        token = sessionStorage.getItem("ngoToken");
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }

    return config;
});


// Start a new conversation or retrieve an existing one
export async function startConversation(otherUserId, otherUserModel) {
    const { data } = await conversationAPI.post("/", {
        otherUserId,
        otherUserModel,
    });

    return data;
}


// Get all conversations of the logged-in User or NGO
export async function getMyConversations() {
    const { data } = await conversationAPI.get("/");

    return data;
}


// Get messages of a particular conversation
export async function getConversationMessages(conversationId) {
    const { data } = await conversationAPI.get(
        `/${conversationId}/messages`
    );

    return data;
}


// Send a message using REST API
export async function sendMessage(conversationId, text) {
    const { data } = await conversationAPI.post(
        `/${conversationId}/messages`,
        { text }
    );

    return data;
}

export default conversationAPI;
