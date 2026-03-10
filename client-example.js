// ==================== HOW TO SEND MESSAGES ====================

// ========== METHOD 1: SOCKET.IO (Real-time) ==========

// Connect with JWT token
const socket = io("http://localhost:5000", {
    auth: { token: "YOUR_JWT_TOKEN" }
})

// Send message
socket.emit("sendMessage", {
    receiverId: "RECEIVER_USER_ID",
    message: "Hello!"
})

// ========== METHOD 2: REST API ==========

// Send message via POST request
// POST /api/messages/send
// Headers: Authorization: Bearer YOUR_TOKEN
// Body: { "receiverId": "USER_ID", "message": "Hello!" }

async function sendMessageREST(receiverId, message) {
    const response = await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer YOUR_JWT_TOKEN"
        },
        body: JSON.stringify({ receiverId, message })
    })
    return await response.json()
}

// Example usage:
// sendMessageREST("RECEIVER_ID", "Hello via REST!")

// ========== GET CONVERSATION ==========

// GET /api/messages/conversation/:userId
// Returns all messages between current user and specified user

async function getConversation(userId) {
    const response = await fetch(`http://localhost:5000/api/messages/conversation/${userId}`, {
        headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }
    })
    return await response.json()
}

// ========== GET ALL CONVERSATIONS ==========

// GET /api/messages/conversations
// Returns list of all conversations with last message

async function getAllConversations() {
    const response = await fetch("http://localhost:5000/api/messages/conversations", {
        headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }
    })
    return await response.json()
}

// ========== MARK AS READ ==========

// PUT /api/messages/read
// Body: { "senderId": "USER_ID" }

async function markAsRead(senderId) {
    const response = await fetch("http://localhost:5000/api/messages/read", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer YOUR_JWT_TOKEN"
        },
        body: JSON.stringify({ senderId })
    })
    return await response.json()
}

