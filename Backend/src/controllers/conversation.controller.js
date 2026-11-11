
const conversationService = require("../services/conversation.service");

const PARTICIPANT_MODELS = ["User", "Ngo"];

// Common error handler
function fail(res, error) {
    return res.status(error.statusCode || 500).json({
        message: error.message || "Something went wrong",
    });
}

// Start or retrieve a conversation
async function startConversationController(req, res) {
    try {
        const { otherUserId, otherUserModel } = req.body;

        if (!otherUserId || !otherUserModel) {
            return res.status(400).json({
                message: "otherUserId and otherUserModel are required"
            });
        }

        if (!PARTICIPANT_MODELS.includes(otherUserModel)) {
            return res.status(400).json({
                message: "Invalid participant model"
            });
        }

        const conversation =
            await conversationService.findOrCreateConversation(
                req.accountId,
                req.accountModel,
                otherUserId,
                otherUserModel
            );

        return res.status(200).json({ conversation });

    } catch (error) {
        return fail(res, error);
    }
}

// Get all conversations for current account
async function getMyConversationsController(req, res) {
    try {
        const conversations =
            await conversationService.getUserConversation(
                req.accountId,
                req.accountModel
            );

        return res.status(200).json({ conversations });

    } catch (error) {
        return fail(res, error);
    }
}

// Get conversation messages
async function getMessagesController(req, res) {
    try {
        const messages =
            await conversationService.getConversationMessages(
                req.params.id,
                req.accountId,
                req.accountModel
            );

        return res.status(200).json({ messages });

    } catch (error) {
        return fail(res, error);
    }
}

// Send a message
async function sendMessageController(req, res) {
    try {
        const { text } = req.body;

        if (typeof text !== "string" || !text.trim()) {
            return res.status(400).json({
                message: "Message text is required"
            });
        }

        const message =
            await conversationService.sendMessage(
                req.params.id,
                req.accountId,
                req.accountModel,
                text
            );

        return res.status(201).json({ message });

    } catch (error) {
        return fail(res, error);
    }
}

module.exports = {
    startConversationController,
    getMyConversationsController,
    getMessagesController,
    sendMessageController,
};
