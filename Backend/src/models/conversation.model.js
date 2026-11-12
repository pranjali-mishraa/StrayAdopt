const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    conversationKey: {
        type: String,
        required: true
    },

    participants: {
        type: [{
            participantId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: "participants.participantModel"
            },
            participantModel: {
                type: String,
                required: true,
                enum: ["User", "Ngo"]
            }
        }],
        required: true,
        validate: {
            validator: (participants) => participants.length === 2,
            message: "A conversation must have exactly 2 participants."
        }
    },

    lastMessage: {
        type: String,
        default: ""
    },

    lastMessageAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

// Prevent duplicate conversations
conversationSchema.index(
    { conversationKey: 1 },
    { unique: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);