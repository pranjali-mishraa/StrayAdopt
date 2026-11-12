const {Router} = require("express");
const conversationController = require("../controllers/conversation.controller");
const protectChat = require("../middlewares/protectChat");

const conversationRouter = Router();

/**
 * @route POST /api/conversations
 * @description find or create a conversation with another user
 * @access private
 */
conversationRouter.post("/", protectChat, conversationController.startConversationController);

/**
 * @route GET /api/conversations
 * @description get all conversations for the logged-in user
 * @access private
 */
conversationRouter.get("/", protectChat, conversationController.getMyConversationsController);

/**
 * @route GET /api/conversations/:id/messages
 * @description get message history for a specific conversation
 * @access private
 */
conversationRouter.get("/:id/messages", protectChat, conversationController.getMessagesController);

/**
 * @route POST /api/conversations/:id/messages
 * @description send a new message in a conversation
 * @access private
 */
conversationRouter.post("/:id/messages", protectChat, conversationController.sendMessageController);

module.exports = conversationRouter;


