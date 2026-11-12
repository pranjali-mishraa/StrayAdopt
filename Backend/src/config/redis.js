require("dotenv").config();
const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
let redisClient = null;
let isRedisConnected = false;
let hasLoggedConnectionError = false;

function initRedis() {
    if (redisClient) return redisClient;

    try {
        redisClient = new Redis(redisUrl, {
            lazyConnect: true,
            maxRetriesPerRequest: 2,
            enableOfflineQueue: false,
            retryStrategy(times) {
                // Reconnect with backoff capped at 5s
                return Math.min(times * 500, 5000);
            },
        });

        redisClient.on("connect", () => {
            isRedisConnected = true;
            hasLoggedConnectionError = false;
            console.log(`[Redis] Connected successfully to ${redisUrl}`);
        });

        redisClient.on("ready", () => {
            isRedisConnected = true;
            hasLoggedConnectionError = false;
        });

        redisClient.on("close", () => {
            isRedisConnected = false;
        });

        redisClient.on("error", (err) => {
            isRedisConnected = false;
            if (err.code === "ECONNREFUSED") {
                if (!hasLoggedConnectionError) {
                    console.warn(`[Redis] Unable to connect to Redis at ${redisUrl}. In-memory fallback will be used while offline.`);
                    hasLoggedConnectionError = true;
                }
            } else {
                console.warn(`[Redis] Error: ${err.message}`);
            }
        });

        // Non-blocking initial connection attempt
        redisClient.connect().catch((err) => {
            if (!hasLoggedConnectionError) {
                console.warn(`[Redis] Initial connection attempt failed (${err.message}). In-memory fallback will be used.`);
                hasLoggedConnectionError = true;
            }
        });
    } catch (err) {
        console.warn(`[Redis] Client initialization error: ${err.message}`);
    }

    return redisClient;
}

function getRedisClient() {
    if (!redisClient) {
        return initRedis();
    }
    return redisClient;
}

function getIsRedisConnected() {
    return isRedisConnected && redisClient && redisClient.status === "ready";
}

module.exports = {
    initRedis,
    getRedisClient,
    getIsRedisConnected,
};

