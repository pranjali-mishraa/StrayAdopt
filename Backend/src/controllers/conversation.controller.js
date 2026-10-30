const conversationService = require("../services/conversation.service");

const PARTICIPANT_MODELS = ["User", "Ngo"];

// One place for error responses, so every handler fails the same way
function fail(res, error) {
    return res.status(error.statusCode || 500).json({
        message: error.message || "Something went wrong",
    });
}

async function startConversationController(req, res) {
    try {
        const { otherUserId, otherUserModel } = req.body;

        if (!otherUserId || !otherUserModel) {
            return res.status(400).json({ message: "otherUserId and otherUserModel are required" });
        }

        if (!PARTICIPANT_MODELS.includes(otherUserModel)) {
            return res.status(400).json({ message: "Invalid participant model" });
        }

        const { id, model } = req.chatUser;

        const conversation = await conversationService.findOrCreateConversation(
            id,
            model,
            otherUserId,
            otherUserModel
        );

        return res.status(200).json({ conversation });
    } catch (error) {
        return fail(res, error);
    }
}

async function getMyConversationsController(req, res) {
    try {
        const { id, model } = req.chatUser;

        const conversations = await conversationService.getUserConversation(id, model);

        return res.status(200).json({ conversations });
    } catch (error) {
        return fail(res, error);
    }
}

async function getMessagesController(req, res) {
    try {
        const { id, model } = req.chatUser;

        const messages = await conversationService.getConversationMessages(req.params.id, id, model);

        return res.status(200).json({ messages });
    } catch (error) {
        return fail(res, error);
    }
}

async function sendMessageController(req, res) {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Message text is required" });
        }

        const { id, model } = req.chatUser;

        const message = await conversationService.sendMessage(req.params.id, id, model, text);

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