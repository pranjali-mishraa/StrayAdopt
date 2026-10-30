const jwt = require("jsonwebtoken");
const ngoModel = require("../models/ngo.model");
const authService = require("../services/auth.service");

async function protectNgo(req, res, next) {
    try {
        const token = req.cookies.ngoToken;

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        if (await authService.isTokenBlacklisted(token)) {
            return res.status(401).json({ message: "Token not valid" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "ngo") {
            return res.status(401).json({ message: "Not authorized" });
        }

        const ngo = await ngoModel.findById(decoded.id);

        if (!ngo) {
            return res.status(401).json({ message: "NGO no longer exists" });
        }

        req.ngo = ngo;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Not authorized, invalid or expired token"
        });
    }
}

function requireVerifiedNgo(req, res, next) {
    if (req.ngo.verificationStatus !== "verified") {
        return res.status(403).json({
            message: "Only verified NGOs can access this feature"
        });
    }

    next();
}

module.exports = { protectNgo, requireVerifiedNgo };