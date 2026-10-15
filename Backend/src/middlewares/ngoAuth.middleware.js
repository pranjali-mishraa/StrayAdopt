const jwt = require("jsonwebtoken");
const ngoModel = require("../models/ngo.model");
const authService = require("../services/auth.service");

async function protectNgo(req, res, next) {
    try {
        const token = req.cookies.ngoToken;
        if (!token) return res.status(401).json({ message: "Not authorized, no token" });

        if (await authService.isTokenBlacklisted(token)) {
            return res.status(401).json({ message: "Token not valid, token was logged out" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "ngo") {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Always load fresh: status can change after the token was issued
        const ngo = await ngoModel.findById(decoded.id);
        if (!ngo) return res.status(401).json({ message: "Not authorized, NGO no longer exists" });

        if (ngo.verificationStatus === "rejected") {
            return res.status(403).json({ message: "Your NGO application has been rejected" });
        }

        req.ngo = ngo;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized, invalid or expired token" });
    }
}

function requireVerifiedNgo(req, res, next) {
    if (req.ngo.verificationStatus !== "verified") {
        return res.status(403).json({ message: "Your NGO is pending admin approval" });
    }
    next();
}

module.exports = { protectNgo, requireVerifiedNgo };