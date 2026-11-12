
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");
const ngoModel = require("../models/ngo.model");

const authService = require("../services/auth.service");
const conversationService = require("../services/conversation.service");

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "https://strayadopt.onrender.com"
            ],
            credentials: false
        }
    });

    // SOCKET AUTHENTICATION
    io.use(async (socket, next) => {
        try {
            const { token, accountType } = socket.handshake.auth || {};

            if (!token || !["User", "Ngo"].includes(accountType)) {
                return next(new Error("Not authorized"));
            }

            // Check blacklist
            const blacklisted = await authService.isTokenBlacklisted(token);

            if (blacklisted) {
                return next(new Error("Token has been logged out"));
            }

            // Verify JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!decoded.id) {
                return next(new Error("Invalid token"));
            }

            if (accountType === "User") {
                // User tokens should not be NGO tokens
                if (decoded.role === "ngo") {
                    return next(new Error("Invalid account type"));
                }

                const user = await userModel.findById(decoded.id);

                if (!user) {
                    return next(new Error("User no longer exists"));
                }

                socket.data.account = user;
                socket.data.accountId = user._id;
                socket.data.accountModel = "User";

            } else {
                if (decoded.role !== "ngo") {
                    return next(new Error("Invalid NGO token"));
                }

                const ngo = await ngoModel.findById(decoded.id);

                if (!ngo) {
                    return next(new Error("NGO no longer exists"));
                }

                socket.data.account = ngo;
                socket.data.accountId = ngo._id;
                socket.data.accountModel = "Ngo";
            }

            next();

        } catch (error) {
            next(new Error("Not authorized, invalid or expired token"));
        }
    });


    // SOCKET CONNECTION
    io.on("connection", (socket) => {

        const accountId = socket.data.accountId;
        const accountModel = socket.data.accountModel;

        console.log(
            `Chat connected: ${accountModel} ${accountId}`
        );


        // JOIN CONVERSATION
        socket.on("join_conversation", async ({ conversationId }) => {
            try {
                await conversationService.getConversationMessages(
                    conversationId,
                    accountId,
                    accountModel
                );

                socket.join(conversationId);

            } catch (error) {
                socket.emit("error_event", {
                    message: error.message
                });
            }
        });


        // LEAVE CONVERSATION
        socket.on("leave_conversation", ({ conversationId }) => {
            socket.leave(conversationId);
        });


        // SEND MESSAGE
        socket.on("send_message", async ({ conversationId, text }, callback) => {
            try {
                const message = await conversationService.sendMessage(
                    conversationId,
                    accountId,
                    accountModel,
                    text
                );

                io.to(conversationId).emit("receive_message", message);

                if (typeof callback === "function") {
                    callback({
                        ok: true,
                        message
                    });
                }

            } catch (error) {
                if (typeof callback === "function") {
                    callback({
                        ok: false,
                        message: error.message
                    });
                }
            }
        });


        socket.on("disconnect", (reason) => {
            console.log(
                `${accountModel} disconnected:`,
                reason
            );
        });

    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
}

module.exports = { initSocket, getIO };
