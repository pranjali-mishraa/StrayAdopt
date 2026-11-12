require("dotenv").config();
const { RedisChatMessageHistory } = require("@langchain/community/stores/message/ioredis");
const {
    mapChatMessagesToStoredMessages,
    mapStoredMessagesToChatMessages,
} = require("@langchain/core/messages");
const { getRedisClient, getIsRedisConnected } = require("../../config/redis");

// In-memory fallback cache when Redis is temporarily offline or unavailable
const inMemoryFallbackStore = new Map();

const SESSION_TTL_SECONDS = process.env.REDIS_SESSION_TTL
    ? parseInt(process.env.REDIS_SESSION_TTL, 10)
    : 86400; // 24 hours default

class SafeRedisChatHistory {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.redisKey = `strayadopt:chat:${sessionId}`;
        this.ttl = SESSION_TTL_SECONDS;
    }

    async getMessages() {
        const client = getRedisClient();
        if (getIsRedisConnected()) {
            try {
                const redisHistory = new RedisChatMessageHistory({
                    sessionId: this.redisKey,
                    sessionTTL: this.ttl,
                    client: client,
                });
                return await redisHistory.getMessages();
            } catch (err) {
                console.warn(
                    `[Redis History] Error reading from Redis for session ${this.sessionId}: ${err.message}. Falling back to memory.`
                );
            }
        }

        // Fallback to in-memory messages
        const stored = inMemoryFallbackStore.get(this.sessionId) || [];
        return mapStoredMessagesToChatMessages(stored);
    }

    async addMessage(message) {
        const client = getRedisClient();
        if (getIsRedisConnected()) {
            try {
                const redisHistory = new RedisChatMessageHistory({
                    sessionId: this.redisKey,
                    sessionTTL: this.ttl,
                    client: client,
                });
                await redisHistory.addMessage(message);
                return;
            } catch (err) {
                console.warn(
                    `[Redis History] Error writing to Redis for session ${this.sessionId}: ${err.message}. Falling back to memory.`
                );
            }
        }

        // Fallback to in-memory store
        const storedMessages = inMemoryFallbackStore.get(this.sessionId) || [];
        const serialized = mapChatMessagesToStoredMessages([message]);
        storedMessages.push(serialized[0]);
        inMemoryFallbackStore.set(this.sessionId, storedMessages);
    }

    async clear() {
        const client = getRedisClient();
        if (getIsRedisConnected()) {
            try {
                const redisHistory = new RedisChatMessageHistory({
                    sessionId: this.redisKey,
                    sessionTTL: this.ttl,
                    client: client,
                });
                await redisHistory.clear();
            } catch (err) {
                console.warn(
                    `[Redis History] Error clearing Redis session ${this.sessionId}: ${err.message}`
                );
            }
        }

        inMemoryFallbackStore.delete(this.sessionId);
    }
}

function getChatHistory(sessionId) {
    const safeSessionId = sessionId || "default_session";
    return new SafeRedisChatHistory(safeSessionId);
}

module.exports = {
    getChatHistory,
    SafeRedisChatHistory,
};
