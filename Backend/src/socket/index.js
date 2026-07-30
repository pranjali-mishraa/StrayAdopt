const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const conversationService = require("../services/conversation.service");

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        try {
            const rawCookie = socket.handshake.headers.cookie;

            if (!rawCookie) {
                return next(new Error("Not authorized"));
            }

            const parsedCookies = cookie.parse(rawCookie);
            const token = parsedCookies.token;

            if (!token) {
                return next(new Error("Not authorized"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.id);

            if (!user) {
                return next(new Error("Not authorized"));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error("Not authorized"));
        }
    });

    io.on("connection", (socket) => {
        socket.on("join_conversation", async ({ conversationId }) => {
            try {
                await conversationService.getConversationMessages(
                    conversationId,
                    socket.user._id
                );

                socket.join(conversationId);
            } catch (error) {
                socket.emit("error_event", {
                    message: error.message,
                });
            }
        });

        socket.on("leave_conversation", ({ conversationId }) => {
            socket.leave(conversationId);
        });

        socket.on("send_message", async ({ conversationId, text }, callback) => {
            try {
                const message = await conversationService.sendMessage(
                    conversationId,
                    socket.user._id,
                    text
                );

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