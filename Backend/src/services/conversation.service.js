const conversationModel = require("../models/conversation.model");
const messageModel = require("../models/message.model");

async function findOrCreateConversation(userId , otherUserID){

    if (userId.toString() === otherUserID.toString()) {
        const error = new Error("You cannot start a conversation with yourself");
        error.statusCode = 400;
        throw error;
    }

    let conversation = await conversationModel.findOne({
        participants: { $all: [userId, otherUserID] },
    });

    if (!conversation) {
        conversation = await conversationModel.create({
            participants: [userId, otherUserID],
        });
    }

    return conversation;

}

async function getUserConversation(userId){
    const conversations = await conversationModel
        .find({ participants: userId })
        .sort({ lastMessageAt: -1 })
        .populate("participants", "username email");

    return conversations;
    
}


async function getConversationMessages(conversationId , userId){

    const conversation  = await conversationModel.findById(conversationId);

    if(!conversation){
        const error = new Error("Conversation not found");
        error.statusCode = 404 ;
        throw  error; 
    }

    const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
        const error = new Error("You are not part of this conversation");
        error.statusCode = 403;
        throw error;
    }

    const messages = await messageModel.find({conversation : conversationId})
    .sort({ createdAt: 1 }) 
    .populate("sender", "username");

    return messages;
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
    getConversationMessages,
    sendMessage,
};
