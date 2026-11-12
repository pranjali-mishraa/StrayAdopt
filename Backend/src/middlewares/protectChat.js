
const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");
const ngoModel = require("../models/ngo.model");

const authService = require("../services/auth.service");

async function protectChat(req, res, next) {
    try {
        // Extract Bearer token
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized, no token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid token format"
            });
        }

        // Check blacklist
        if (await authService.isTokenBlacklisted(token)) {
            return res.status(401).json({
                message: "Token has been logged out"
            });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id) {
            return res.status(401).json({
                message: "Invalid token payload"
            });
        }

        // NGO authentication
        if (decoded.role === "ngo") {
            const ngo = await ngoModel.findById(decoded.id);

            if (!ngo) {
                return res.status(401).json({
                    message: "NGO not found"
                });
            }

            if (ngo.verificationStatus !== "verified") {
                return res.status(403).json({
                    message: "Only verified NGOs can access chat"
                });
            }

            req.ngo = ngo;

            req.accountId = ngo._id;
            req.accountModel = "Ngo";

            // Preserve compatibility with existing code
            req.chatUser = {
                id: ngo._id,
                model: "Ngo"
            };

            req.authToken = token;

            return next();
        }

        // User authentication
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        req.user = user;

        req.accountId = user._id;
        req.accountModel = "User";

        // Preserve compatibility with existing code
        req.chatUser = {
            id: user._id,
            model: "User"
        };

        req.authToken = token;

        return next();

    } catch (error) {
        return res.status(401).json({
            message: "Not authorized, invalid or expired token"
        });
    }
}

module.exports = protectChat;
