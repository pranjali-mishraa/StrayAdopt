
const mongoose = require("mongoose");

const ngoHighlightSchema = new mongoose.Schema(
    {
        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ngo",
            required: true,
        },

        mediaUrl: {
            type: String,
            required: true,
            trim: true,
        },

        caption: {
            type: String,
            trim: true,
            maxlength: 300,
            default: "",
        },

        contentType: {
            type: String,
            enum: ["highlight", "story"],
            default: "highlight",
            required: true,
        },

        mediaType: {
            type: String,
            enum: ["image", "video"],
            required: true,
        },

        expiresAt: {
            type: Date,
            default: null,
            validate: {
                validator: function (value) {
                    return this.contentType === "story"
                        ? value instanceof Date && !Number.isNaN(value.getTime())
                        : value == null;
                },
                message:
                    "Stories require an expiry date; highlights must not have one.",
            },
        },
    },
    { timestamps: true }
);

ngoHighlightSchema.index({ ngoId: 1, createdAt: -1 });

module.exports = mongoose.model("NgoHighlight", ngoHighlightSchema);
