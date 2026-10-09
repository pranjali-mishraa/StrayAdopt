const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one NGO profile per account
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String, // Cloudinary URL of the NGO photo/logo
            required: true,
        },
        address: {
            type: String,
            trim: true,
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
                validate: {
                    validator: (c) =>
                        Array.isArray(c) &&
                        c.length === 2 &&
                        c[0] >= -180 && c[0] <= 180 &&
                        c[1] >= -90 && c[1] <= 90,
                    message: "Coordinates must be [longitude, latitude] within valid ranges.",
                },
            },
        },
        contact: {
            phone: { type: String, trim: true },
            email: { type: String, trim: true, lowercase: true },
            website: { type: String, trim: true },
        },
        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },
        verificationDocuments: [
            {
                label: { type: String, trim: true }, // e.g. "Registration certificate"
                url: { type: String, required: true }, // Cloudinary URL, never raw files
            },
        ],
        // Reserved for the future admin-verification step
        verifiedAt: { type: Date },
        rejectionReason: { type: String, trim: true },
    },
    { timestamps: true }
);

ngoSchema.index({ location: "2dsphere" });
ngoSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model("Ngo", ngoSchema);