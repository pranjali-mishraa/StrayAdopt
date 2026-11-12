
const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        image: {
            type: String,
            required: true,
            trim: true,
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
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: (coordinates) =>
                        Array.isArray(coordinates) &&
                        coordinates.length === 2 &&
                        coordinates[0] >= -180 &&
                        coordinates[0] <= 180 &&
                        coordinates[1] >= -90 &&
                        coordinates[1] <= 90,
                    message:
                        "Coordinates must be [longitude, latitude] within valid ranges.",
                },
            },
        },

        contact: {
            phone: { type: String, trim: true },
            website: { type: String, trim: true },
        },

        verificationDocuments: [
            {
                label: { type: String, trim: true },
                url: { type: String, required: true },
            },
        ],

        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },

        verifiedAt: {
            type: Date,
            default: null,
        },

        rejectionReason: {
            type: String,
            trim: true,
            default: null,
        },
    },
    { timestamps: true }
);

ngoSchema.index({ location: "2dsphere" });
ngoSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model("Ngo", ngoSchema);
