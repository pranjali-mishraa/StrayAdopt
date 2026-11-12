const mongoose = require("mongoose");
const ngoModel = require("../models/ngo.model");
const ngoHighlightModel = require("../models/ngoHighlight.model");
const { uploadToCloudinary } = require("./upload.service");

const PUBLIC_FIELDS = "-email -verificationDocuments -rejectionReason -isEmailVerified";
const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

function httpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Only verified NGOs are publicly visible
async function getVerifiedNgo(ngoId) {
    if (!mongoose.isValidObjectId(ngoId)) throw httpError("NGO not found", 404);

    const ngo = await ngoModel
        .findOne({ _id: ngoId, verificationStatus: "verified" })
        .select(PUBLIC_FIELDS);

    if (!ngo) throw httpError("NGO not found", 404);
    return ngo;
}

async function createHighlight({ ngoId, file, caption, contentType }) {
    if (!file) throw httpError("A media file is required", 400);

    const type = contentType === "story" ? "story" : "highlight";
    const uploaded = await uploadToCloudinary(file.buffer, "strayadopt/ngo-highlights");

    return ngoHighlightModel.create({
        ngoId,
        mediaUrl: uploaded.secure_url,
        mediaType: file.mimetype.startsWith("video/") ? "video" : "image", // never trust the client
        caption,
        contentType: type,
        // The server sets the expiry, so clients can't choose their own
        expiresAt: type === "story" ? new Date(Date.now() + STORY_LIFETIME_MS) : null,
    });
}

async function getPublicHighlights(ngoId) {
    await getVerifiedNgo(ngoId);

    return ngoHighlightModel
        .find({
            ngoId,
            $or: [
                { contentType: "highlight" },
                { contentType: "story", expiresAt: { $gt: new Date() } },
            ],
        })
        .sort({ createdAt: -1 });
}

module.exports = { getVerifiedNgo, createHighlight, getPublicHighlights };