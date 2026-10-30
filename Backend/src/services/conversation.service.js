const conversationModel = require("../models/conversation.model");
const messageModel = require("../models/message.model");

const validModels = ["User", "Ngo"];

// Generate a deterministic key for both participants
function generateConversationKey(id1, model1, id2, model2) {
    return [
        `${model1}:${id1}`,
        `${model2}:${id2}`
    ].sort().join("_");
}

// Find or create conversation
async function findOrCreateConversation(
    currentUserId,
    currentUserModel,
    otherUserId,
    otherUserModel
) {
    if (
        !validModels.includes(currentUserModel) ||
        !validModels.includes(otherUserModel)
    ) {
        const error = new Error("Invalid participant type");
        error.statusCode = 400;
        throw error;
    }

    if (
        currentUserId.toString() === otherUserId.toString() &&
        currentUserModel === otherUserModel
    ) {
        const error = new Error("You cannot chat with yourself");
        error.statusCode = 400;
        throw error;
    }

    const conversationKey = generateConversationKey(
        currentUserId,
        currentUserModel,
        otherUserId,
        otherUserModel
    );

    // Always use the same participant order
    const participants = [
        { participantId: currentUserId, participantModel: currentUserModel },
        { participantId: otherUserId, participantModel: otherUserModel }
    ].sort((a, b) =>
        `${a.participantModel}:${a.participantId}`.localeCompare(
            `${b.participantModel}:${b.participantId}`
        )
    );

    // Check existing conversation
    let conversation = await conversationModel.findOne({ conversationKey });

    if (conversation) return conversation;

    try {
        // Unique index ensures only one request can create this key
        conversation = await conversationModel.create({
            conversationKey,
            participants
        });

        return conversation;

    } catch (error) {
        // Another simultaneous request may have created it first
        if (error.code === 11000) {
            conversation = await conversationModel.findOne({ conversationKey });

            if (conversation) return conversation;
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


// Verify conversation participant
async function getConversationForParticipant(
    conversationId,
    userId,
    userModel
) {
    const conversation = await conversationModel.findById(conversationId);

    if (!conversation) {
        const error = new Error("Conversation not found");
        error.statusCode = 404;
        throw error;
    }

    const isParticipant = conversation.participants.some(
        p =>
            p.participantId.toString() === userId.toString() &&
            p.participantModel === userModel
    );

    if (!isParticipant) {
        const error = new Error("You are not part of this conversation");
        error.statusCode = 403;
        throw error;
    }

    return conversation;
}


// Get message history
async function getConversationMessages(conversationId, userId, userModel) {
    await getConversationForParticipant(conversationId, userId, userModel);

    return await messageModel
        .find({ conversation: conversationId })
        .sort({ createdAt: 1 })
        .populate("sender");
}


// Send message
async function sendMessage(conversationId, senderId, senderModel, text) {
    const conversation = await getConversationForParticipant(
        conversationId,
        senderId,
        senderModel
    );

    const message = await messageModel.create({
        conversation: conversationId,
        sender: senderId,
        senderModel,
        text
    });

    conversation.lastMessage = text;
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