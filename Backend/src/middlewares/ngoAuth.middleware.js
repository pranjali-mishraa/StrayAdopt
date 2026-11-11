
const jwt = require("jsonwebtoken");
const ngoModel = require("../models/ngo.model");
const authService = require("../services/auth.service");

async function protectNgo(req, res, next) {
    try {
        // 1. Extract Bearer token from Authorization header
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

        // 2. Check whether token has been blacklisted
        const isBlacklisted = await authService.isTokenBlacklisted(token);

        if (isBlacklisted) {
            return res.status(401).json({
                message: "Token is no longer valid. Please log in again."
            });
        }

        // 3. Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Ensure token belongs to an NGO
        if (!decoded.id || decoded.role !== "ngo") {
            return res.status(401).json({
                message: "Not authorized as NGO"
            });
        }

        // 5. Find NGO in database
        const ngo = await ngoModel.findById(decoded.id);

        if (!ngo) {
            return res.status(401).json({
                message: "NGO account no longer exists"
            });
        }

        // 6. Attach authenticated NGO to request
        req.ngo = ngo;
        req.authToken = token;

        next();

    } catch (error) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Not authorized, invalid or expired token"
            });
        }

        console.error("NGO authentication middleware error:", error);

        return res.status(500).json({
            message: "Authentication failed"
        });
    }
}


// Only verified NGOs can perform restricted actions
function requireVerifiedNgo(req, res, next) {
    if (!req.ngo) {
        return res.status(401).json({
            message: "NGO authentication required"
        });
    }

    if (req.ngo.verificationStatus !== "verified") {
        return res.status(403).json({
            message: "Only verified NGOs can access this feature"
        });
    }

    next();
}

module.exports = {
    protectNgo,
    requireVerifiedNgo
};
