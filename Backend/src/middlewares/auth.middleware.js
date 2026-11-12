
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const authService = require("../services/auth.service");

async function protect(req, res, next) {
    try {
        // Extract Bearer token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized, no token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Not authorized, invalid token format"
            });
        }

        // Check whether this token has been logged out
        const blacklistedToken = await authService.isTokenBlacklisted(token);

        if (blacklistedToken) {
            return res.status(401).json({
                message: "Token not valid, token was logged out"
            });
        }

        // Verify JWT
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decodedToken.id);

        if (!user) {
            return res.status(401).json({
                message: "Not authorized, user no longer exists"
            });
        }

        // Attach authenticated user and token to request
        req.user = user;
        req.authToken = token;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Not authorized, invalid or expired token"
        });
    }
}

module.exports = protect;
