const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const ngoModel = require("../models/ngo.model");
const authService = require("../services/auth.service");

async function protectChat(req, res, next) {
    try {
        const ngoToken = req.cookies.ngoToken;
        const userToken = req.cookies.token;

        // NGO authentication
        if (ngoToken) {
            if (await authService.isTokenBlacklisted(ngoToken)) {
                return res.status(401).json({ message: "Invalid token" });
            }

            const decoded = jwt.verify(ngoToken, process.env.JWT_SECRET);

            if (decoded.role !== "ngo") {
                return res.status(401).json({ message: "Not authorized" });
            }

            const ngo = await ngoModel.findById(decoded.id);

            if (!ngo) {
                return res.status(401).json({ message: "NGO not found" });
            }

            if (ngo.verificationStatus !== "verified") {
                return res.status(403).json({
                    message: "Only verified NGOs can access chat"
                });
            }

            req.ngo = ngo;
            req.chatUser = { id: ngo._id, model: "Ngo" };

            return next();
        }

        // Normal user authentication
        if (!userToken) {
            return res.status(401).json({ message: "Not authorized" });
        }

        if (await authService.isTokenBlacklisted(userToken)) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        req.chatUser = { id: user._id, model: "User" };

        return next();

    } catch (error) {
        return res.status(401).json({
            message: "Not authorized, invalid or expired token"
        });
    }
}

module.exports = protectChat;