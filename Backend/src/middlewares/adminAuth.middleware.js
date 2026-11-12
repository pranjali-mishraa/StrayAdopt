
const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin.model");
const adminAuthService = require("../services/adminAuth.service");

async function protectAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized, no token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid token format",
            });
        }

        const isBlacklisted =
            await adminAuthService.isTokenBlacklisted(token);

        if (isBlacklisted) {
            return res.status(401).json({
                message: "Token is no longer valid. Please log in again.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id || decoded.role !== "admin") {
            return res.status(401).json({
                message: "Not authorized as Admin",
            });
        }

        const admin = await adminModel.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({
                message: "Admin account no longer exists",
            });
        }

        req.admin = admin;
        req.authToken = token;

        next();

    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
            return res.status(401).json({
                message: "Not authorized, invalid or expired token",
            });
        }

        console.error("Admin authentication middleware error:", error);

        return res.status(500).json({
            message: "Authentication failed",
        });
    }
}

module.exports = protectAdmin;
