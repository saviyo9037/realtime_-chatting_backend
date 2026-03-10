# TODO: Real-time Messaging with Socket.io

## Completed:
- [x] 1. Install socket.io
- [x] 2. Create messageSchema.js (sender, receiver, message, timestamp, read)
- [x] 3. Create socketService.js (Socket.io initialization with JWT auth)
- [x] 4. Create messageController.js (get conversation, conversations, mark read)
- [x] 5. Create messageRoutes.js
- [x] 6. Update router.js
- [x] 7. Update index.js with HTTP server and Socket.io

## API Endpoints:
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user
- GET /api/messages/conversation/:userId - Get conversation
- GET /api/messages/conversations - Get all conversations
- PUT /api/messages/read - Mark messages as read

## Socket Events:
- sendMessage - Send private message
- newMessage - Receive message
- typing - User typing indicator
- markRead - Mark messages as read
- onlineUsers - Online users list

