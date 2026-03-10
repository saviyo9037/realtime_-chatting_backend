const express = require("express")
const router = express.Router()
const messageController = require("../controller/messageController")
const authMiddleware = require("../middleware/authMiddleware")

// All routes require authentication
router.use(authMiddleware)

// Send a message (REST API)
router.post("/send", messageController.sendMessage)

// Get conversation with a specific user
router.get("/conversation/:userId", messageController.getConversation)

// Get all conversations
router.get("/conversations", messageController.getAllConversations)

// Mark messages as read
router.put("/read", messageController.markAsRead)

module.exports = router

