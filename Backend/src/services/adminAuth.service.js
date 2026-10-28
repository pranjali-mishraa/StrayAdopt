
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const ngoModel = require("../models/ngo.model");

const STATUSES = ["pending", "verified", "rejected"];

function httpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

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

// Add secure view and download URLs for verification documents.
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
    listNgos,
    getNgoDetails,
    approveNgo,
    rejectNgo,
};
