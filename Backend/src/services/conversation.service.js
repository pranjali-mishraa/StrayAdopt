const conversationModel = require("../models/conversation.model");
const messageModel = require("../models/message.model");

async function findOrCreateConversation(userId, otherUserID) {

    console.log("findOrCreateConversation called", {
        userId: userId.toString(),
        otherUserID: otherUserID.toString(),
        time: Date.now(),
    });

    if (userId.toString() === otherUserID.toString()) {
        const error = new Error("You cannot start a conversation with yourself");
        error.statusCode = 400;
        throw error;
    }

    const sortedParticipants = [userId.toString(), otherUserID.toString()].sort();

let conversation = await conversationModel.findOne({
    participants: sortedParticipants,
});

    if (conversation) {
        return conversation;
    }

    try {
        conversation = await conversationModel.create({
            participants: sortedParticipants,
        });
        return conversation;
    } catch (error) {

        console.log("ERROR:", error);
        console.log("CODE:", error.code);
        console.log("MESSAGE:", error.message);
        if (error.code === 11000) {
            conversation = await conversationModel.findOne({
                participants: sortedParticipants,
            });
            return conversation;
        }
        throw error;
    }
}



async function getUserConversation(userId){
    const conversations = await conversationModel
        .find({ participants: userId })
        .sort({ lastMessageAt: -1 })
        .populate("participants", "username email");

    return conversations;
    
}


async function getConversationMessages(conversationId , userId){
    await getConversationForParticipant(conversationId, userId);

    const messages = await messageModel.find({conversation : conversationId})
    .sort({ createdAt: 1 })
    .populate("sender", "username");

    return messages;
}

async function getConversationForParticipant(conversationId, userId) {
    const conversation = await conversationModel.findById(conversationId);

    if (!conversation) {
        const error = new Error("Conversation not found");
        error.statusCode = 404;
        throw error;
    }

    const isParticipant = conversation.participants.some(
        (participant) => participant.toString() === userId.toString()
    );

    if (!isParticipant) {
        const error = new Error("You are not part of this conversation");
        error.statusCode = 403;
        throw error;
    }

    return conversation;
}


async function sendMessage(conversationId, senderId, text) {
    const conversation = await conversationModel.findById(conversationId);

    if (!conversation) {
        const error = new Error("Conversation not found");
        error.statusCode = 404;
        throw error;
    }

    const isParticipant = conversation.participants.some(
        (p) => p.toString() === senderId.toString()
    );

    if (!isParticipant) {
        const error = new Error("You are not part of this conversation");
        error.statusCode = 403;
        throw error;
    }

    const message = await messageModel.create({
        conversation: conversationId,
        sender: senderId,
        text,
    });

    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await message.populate("sender", "username");

    return populatedMessage;
}

module.exports = {
    findOrCreateConversation,
    getUserConversation,
    getConversationForParticipant,
    getConversationMessages,
    sendMessage,
};
