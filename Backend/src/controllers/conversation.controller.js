const conversationService = require("../services/conversation.service");

async function startConversationController(req, res) {
    try {
        const { otherUserId } = req.body;

        if (!otherUserId) {
            return res.status(400).json({ message: "otherUserId is required" });
        }

        const conversation = await conversationService.findOrCreateConversation(
            req.user._id,
            otherUserId
        );

        return res.status(200).json({ conversation });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

async function getMyConversationsController(req, res) {
    try {
        const conversations = await conversationService.getUserConversation(req.user._id);
        return res.status(200).json({ conversations });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}

async function getMessagesController(req, res) {
    try {
        const messages = await conversationService.getConversationMessages(
            req.params.id,
            req.user._id
        );
        return res.status(200).json({ messages });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

async function sendMessageController(req, res) {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Message text is required" });
        }

        const message = await conversationService.sendMessage(
            req.params.id,
            req.user._id,
            text
        );

        return res.status(201).json({ message });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

module.exports = {
    startConversationController,
    getMyConversationsController,
    getMessagesController,
    sendMessageController,
};