import api from "../../auth/services/authService";

/**
 * Get all conversations for the logged-in user
 */
export async function getConversations() {
  const response = await api.get("/api/conversations");
  return response.data;
}

/**
 * Get all messages for a conversation
 */
export async function getMessages(conversationId) {
  const response = await api.get(
    `/api/conversations/${conversationId}/messages`
  );
  return response.data;
}

/**
 * Start a new conversation or return the existing one
 */
export async function startConversation(otherUserId) {
  const response = await api.post("/api/conversations", {
    otherUserId,
  });

  return response.data;
}

/**
 * Send a message using the REST API.
 * (Useful as a fallback or if you don't want to use Socket.IO.)
 */
export async function sendMessage(conversationId, text) {
  const response = await api.post(
    `/api/conversations/${conversationId}/messages`,
    {
      text,
    }
  );

  return response.data;
}