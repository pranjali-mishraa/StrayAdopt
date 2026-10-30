
const mongoose = require("mongoose");

const conversationModel = require("../models/conversation.model");
const messageModel = require("../models/message.model");
const userModel = require("../models/user.model");
const ngoModel = require("../models/ngo.model");

const validModels = ["User", "Ngo"];

// Generate the same key regardless of who starts the conversation
function generateConversationKey(id1, model1, id2, model2) {
    return [
        `${model1}:${id1}`,
        `${model2}:${id2}`
    ].sort().join("_");
}

// Validate participant and account status
async function validateParticipant(id, model) {
    if (!validModels.includes(model)) {
        const error = new Error("Invalid participant type");
        error.statusCode = 400;
        throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid participant ID");
        error.statusCode = 400;
        throw error;
    }

    let participant;

    if (model === "User") {
        participant = await userModel.findById(id);
    } else {
        participant = await ngoModel.findById(id);

        if (
            participant &&
            participant.verificationStatus !== "verified"
        ) {
            const error = new Error(
                "Only verified NGOs can participate in chat"
            );
            error.statusCode = 403;
            throw error;
        }
    }

    if (!participant) {
        const error = new Error("Participant not found");
        error.statusCode = 404;
        throw error;
    }

    return participant;
}


// Find or create conversation
async function findOrCreateConversation(
    currentUserId,
    currentUserModel,
    otherUserId,
    otherUserModel
) {
    // Validate both participant types and accounts
    await validateParticipant(currentUserId, currentUserModel);
    await validateParticipant(otherUserId, otherUserModel);

    // Prevent self conversation
    if (
        currentUserId.toString() === otherUserId.toString() &&
        currentUserModel === otherUserModel
    ) {
        const error = new Error(
            "You cannot start a conversation with yourself"
        );
        error.statusCode = 400;
        throw error;
    }

    const conversationKey = generateConversationKey(
        currentUserId,
        currentUserModel,
        otherUserId,
        otherUserModel
    );

    // Keep participant order consistent
    const participants = [
        {
            participantId: currentUserId,
            participantModel: currentUserModel
        },
        {
            participantId: otherUserId,
            participantModel: otherUserModel
        }
    ].sort((a, b) =>
        `${a.participantModel}:${a.participantId}`.localeCompare(
            `${b.participantModel}:${b.participantId}`
        )
    );

    // Check existing conversation
    let conversation = await conversationModel.findOne({
        conversationKey
    });

    if (conversation) {
        return conversation;
    }

    try {
        // Unique index prevents duplicate conversations
        conversation = await conversationModel.create({
            conversationKey,
            participants
        });

        return conversation;

    } catch (error) {
        // Another simultaneous request may have created it
        if (error.code === 11000) {
            conversation = await conversationModel.findOne({
                conversationKey
            });

            if (conversation) {
                return conversation;
            }
        }

        throw error;
    }
}


// Get all conversations for current account
async function getUserConversation(userId, userModel) {
    return await conversationModel
        .find({
            participants: {
                $elemMatch: {
                    participantId: userId,
                    participantModel: userModel
                }
            }
        })
        .sort({ lastMessageAt: -1 })
        .populate({
            path: "participants.participantId",
            select: "username name email image"
        });
}


// Get conversation and verify participant access
async function getConversationForParticipant(
    conversationId,
    userId,
    userModel
) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        const error = new Error("Invalid conversation ID");
        error.statusCode = 400;
        throw error;
    }

    const conversation = await conversationModel.findById(
        conversationId
    );

    if (!conversation) {
        const error = new Error("Conversation not found");
        error.statusCode = 404;
        throw error;
    }

    // Verify current account belongs to conversation
    const isParticipant = conversation.participants.some(
        participant =>
            participant.participantId.toString() === userId.toString() &&
            participant.participantModel === userModel
    );

    if (!isParticipant) {
        const error = new Error(
            "You are not part of this conversation"
        );
        error.statusCode = 403;
        throw error;
    }

    // Revalidate NGO status in case verification was revoked
    for (const participant of conversation.participants) {
        if (participant.participantModel === "Ngo") {
            await validateParticipant(
                participant.participantId,
                "Ngo"
            );
        }
    }

    return conversation;
}


// Get message history
async function getConversationMessages(
    conversationId,
    userId,
    userModel
) {
    await getConversationForParticipant(
        conversationId,
        userId,
        userModel
    );

    return await messageModel
        .find({ conversation: conversationId })
        .sort({ createdAt: 1 })
        .populate("sender");
}


// Send message
async function sendMessage(
    conversationId,
    senderId,
    senderModel,
    text
) {
    const conversation = await getConversationForParticipant(
        conversationId,
        senderId,
        senderModel
    );

    const cleanText = text.trim();

    if (!cleanText) {
        const error = new Error("Message text is required");
        error.statusCode = 400;
        throw error;
    }

    const message = await messageModel.create({
        conversation: conversationId,
        sender: senderId,
        senderModel,
        text: cleanText
    });

    conversation.lastMessage = cleanText;
    conversation.lastMessageAt = new Date();

    await conversation.save();

    return await message.populate("sender");
}


module.exports = {
    findOrCreateConversation,
    getUserConversation,
    getConversationForParticipant,
    getConversationMessages,
    sendMessage
};
