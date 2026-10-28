const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin.model");
const authService = require("../services/auth.service");

async function protectAdmin(req, res, next) {
    try {
        const token = req.cookies.adminToken;
        if (!token) return res.status(401).json({ message: "Not authorized, no token" });

        if (await authService.isTokenBlacklisted(token)) {
            return res.status(401).json({ message: "Token not valid, token was logged out" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(401).json({ message: "Not authorized" });
        }

        const admin = await adminModel.findById(decoded.id);
        if (!admin) return res.status(401).json({ message: "Not authorized, admin no longer exists" });

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized, invalid or expired token" });
    }
}

module.exports = protectAdmin;