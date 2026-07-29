const {Router} = require("express");
const conversationController = require("../controllers/conversation.controller");
const protect = require("../middlewares/auth.middleware");

const conversationRouter = Router();

/**
 * @route POST /api/conversations
 * @description find or create a conversation with another user
 * @access private
 */
conversationRouter.post("/", protect, conversationController.startConversationController);

/**
 * @route GET /api/conversations
 * @description get all conversations for the logged-in user
 * @access private
 */
conversationRouter.get("/", protect, conversationController.getMyConversationsController);

/**
 * @route GET /api/conversations/:id/messages
 * @description get message history for a specific conversation
 * @access private
 */
conversationRouter.get("/:id/messages", protect, conversationController.getMessagesController);

/**
 * @route POST /api/conversations/:id/messages
 * @description send a new message in a conversation
 * @access private
 */
conversationRouter.post("/:id/messages", protect, conversationController.sendMessageController);

module.exports = conversationRouter;


