
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const userModel = require("../models/user.model");
const ngoModel = require("../models/ngo.model");
const authService = require("../services/auth.service");
const conversationService = require("../services/conversation.service");

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });

    // Authenticate both User and NGO sockets
    io.use(async (socket, next) => {
        try {
            const rawCookie = socket.handshake.headers.cookie;

            if (!rawCookie) {
                return next(new Error("Not authorized"));
            }

            const parsedCookies = cookie.parse(rawCookie);

            const userToken = parsedCookies.token;
            const ngoToken = parsedCookies.ngoToken;

            // Reject ambiguous sessions
            if (userToken && ngoToken) {
                return next(new Error("Multiple account sessions detected"));
            }

            const token = ngoToken || userToken;

            if (!token) {
                return next(new Error("Not authorized"));
            }

            if (await authService.isTokenBlacklisted(token)) {
                return next(new Error("Token is no longer valid"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // NGO authentication
            if (ngoToken) {
                if (decoded.role !== "ngo") {
                    return next(new Error("Invalid NGO token"));
                }

                const ngo = await ngoModel.findById(decoded.id);

                if (!ngo || ngo.verificationStatus !== "verified") {
                    return next(new Error("Only verified NGOs can access chat"));
                }

                socket.chatUser = {
                    id: ngo._id,
                    model: "Ngo",
                };
            }

            // User authentication
            else {
                const user = await userModel.findById(decoded.id);

                if (!user) {
                    return next(new Error("User not found"));
                }

                socket.chatUser = {
                    id: user._id,
                    model: "User",
                };
            }

            next();

        } catch (error) {
            next(new Error("Not authorized, invalid or expired token"));
        }
    });


    io.on("connection", (socket) => {

        // Join conversation room
        socket.on("join_conversation", async ({ conversationId }) => {
            try {
                await conversationService.getConversationForParticipant(
                    conversationId,
                    socket.chatUser.id,
                    socket.chatUser.model
                );

                socket.join(conversationId);

            } catch (error) {
                socket.emit("error_event", {
                    message: error.message,
                });
            }
        });


        // Leave conversation room
        socket.on("leave_conversation", ({ conversationId }) => {
            socket.leave(conversationId);
        });


        // Send message
        socket.on("send_message", async ({ conversationId, text }, callback) => {
            try {
                if (!text || !text.trim()) {
                    throw new Error("Message text is required");
                }

                // Verify participant and send message
                const message = await conversationService.sendMessage(
                    conversationId,
                    socket.chatUser.id,
                    socket.chatUser.model,
                    text
                );

                // Deliver to everyone in conversation
                io.to(conversationId).emit("receive_message", message);

                callback?.({
                    ok: true,
                    message,
                });

            } catch (error) {
                callback?.({
                    ok: false,
                    message: error.message,
                });
            }
        });


        socket.on("disconnect", () => {});
    });
}


function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }

    return io;
}


module.exports = {
    initSocket,
    getIO,
};
