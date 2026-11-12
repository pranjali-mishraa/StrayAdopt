
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const cloudinary = require("../config/cloudinary");
const ngoModel = require("../models/ngo.model");
const adminModel = require("../models/admin.model");
const blacklistTokenModel = require("../models/blacklistToken.model");

const STATUSES = ["pending", "verified", "rejected"];

function httpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// ===============================
// ADMIN AUTHENTICATION
// ===============================

function generateAdminToken(admin) {
    return jwt.sign(
        {
            id: admin._id,
            email: admin.email,
            role: "admin",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

async function loginAdmin({ email, password }) {
    if (!email || !password) {
        throw httpError("Email and password are required", 400);
    }

    const admin = await adminModel
        .findOne({ email: email.trim().toLowerCase() })
        .select("+password");

    if (!admin) {
        throw httpError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        admin.password
    );

    if (!isPasswordValid) {
        throw httpError("Invalid email or password", 401);
    }

    const token = generateAdminToken(admin);

    const adminData = admin.toObject();
    delete adminData.password;

    return {
        token,
        admin: adminData,
    };
}

async function logoutAdmin(token) {
    if (!token) {
        throw httpError("Token not provided", 400);
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw httpError("Invalid or expired token", 401);
    }

    if (!decoded.id || decoded.role !== "admin" || !decoded.exp) {
        throw httpError("Invalid admin token", 401);
    }

    const alreadyBlacklisted = await blacklistTokenModel.findOne({ token });

    if (!alreadyBlacklisted) {
        await blacklistTokenModel.create({
            token,
            expiresAt: new Date(decoded.exp * 1000),
        });
    }

    return { message: "Admin logged out successfully" };
}

async function isTokenBlacklisted(token) {
    if (!token) return false;

    const blacklistedToken = await blacklistTokenModel.findOne({ token });

    return Boolean(blacklistedToken);
}

// ===============================
// NGO MANAGEMENT
// ===============================

async function listNgos(status = "pending") {
    if (!STATUSES.includes(status)) {
        throw httpError("Invalid status", 400);
    }

    return ngoModel
        .find({ verificationStatus: status })
        .sort({ createdAt: -1 });
}

async function getNgoForReview(id) {
    if (!mongoose.isValidObjectId(id)) {
        throw httpError("NGO not found", 404);
    }

    const ngo = await ngoModel.findById(id);

    if (!ngo) {
        throw httpError("NGO not found", 404);
    }

    return ngo;
}

async function getNgoDetails(id) {
    const ngo = (await getNgoForReview(id)).toObject();

    ngo.verificationDocuments = (ngo.verificationDocuments || []).map((doc) => {
        if (!doc.publicId) {
            return {
                ...doc,
                viewUrl: doc.url,
                downloadUrl: doc.url?.replace(
                    "/upload/",
                    "/upload/fl_attachment/"
                ),
            };
        }

        const resource_type = doc.resourceType || "image";

        return {
            ...doc,
            viewUrl: cloudinary.url(doc.publicId, {
                type: "authenticated",
                resource_type,
                sign_url: true,
                secure: true,
                format: doc.format,
            }),
            downloadUrl: cloudinary.utils.private_download_url(
                doc.publicId,
                doc.format,
                {
                    type: "authenticated",
                    resource_type,
                    attachment: true,
                    expires_at: Math.floor(Date.now() / 1000) + 10 * 60,
                }
            ),
        };
    });

    return ngo;
}

async function approveNgo(id) {
    const ngo = await getNgoForReview(id);

    if (!["pending", "rejected"].includes(ngo.verificationStatus)) {
        throw httpError(
            "Only pending or rejected NGOs can be approved",
            400
        );
    }

    ngo.verificationStatus = "verified";
    ngo.verifiedAt = new Date();
    ngo.rejectionReason = null;

    await ngo.save();

    return ngo;
}

async function rejectNgo(id, reason) {
    if (!reason?.trim()) {
        throw httpError("A rejection reason is required", 400);
    }

    const ngo = await getNgoForReview(id);

    if (ngo.verificationStatus !== "pending") {
        throw httpError("Only pending NGOs can be rejected", 400);
    }

    ngo.verificationStatus = "rejected";
    ngo.rejectionReason = reason.trim();
    ngo.verifiedAt = null;

    await ngo.save();

    return ngo;
}

module.exports = {
    // Admin authentication
    loginAdmin,
    logoutAdmin,
    isTokenBlacklisted,

    // NGO management
    listNgos,
    getNgoDetails,
    approveNgo,
    rejectNgo,
};
