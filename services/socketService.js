const socketIO = require("socket.io")
const jwt = require("jsonwebtoken")

let io

// Track online users
const onlineUsers = new Map()

exports.initialize = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    })

    // Socket authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token
        
        if (!token) {
            return next(new Error("Authentication error"))
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY)
            socket.user = decoded
            next()
        } catch (error) {
            next(new Error("Authentication error"))
        }
    })

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.user.id}`)

        // Add user to online users
        onlineUsers.set(socket.user.id, socket.id)

        // Emit online users list
        io.emit("onlineUsers", Array.from(onlineUsers.keys()))

        // Join user's personal room
        socket.join(`user_${socket.user.id}`)

        // Handle private message
        socket.on("sendMessage", async (data) => {
            const { receiverId, message } = data

            // Save message to database
            const Message = require("../models/messageSchema")
            const newMessage = new Message({
                sender: socket.user.id,
                receiver: receiverId,
                message: message
            })
            await newMessage.save()

            // Send to receiver if online
            const receiverSocketId = onlineUsers.get(receiverId)
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", {
                    sender: socket.user.id,
                    message: message,
                    timestamp: newMessage.timestamp
                })
            }

            // Confirm to sender
            socket.emit("messageSent", {
                success: true,
                message: newMessage
            })
        })

        // Handle typing event
        socket.on("typing", (data) => {
            const receiverSocketId = onlineUsers.get(data.receiverId)
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", {
                    senderId: socket.user.id,
                    senderName: socket.user.name
                })
            }
        })

        // Handle read receipt
        socket.on("markRead", async (data) => {
            const Message = require("../models/messageSchema")
            await Message.updateMany(
                { sender: data.senderId, receiver: socket.user.id, read: false },
                { read: true }
            )
            
            // Notify sender that messages were read
            const senderSocketId = onlineUsers.get(data.senderId)
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesRead", {
                    readerId: socket.user.id
                })
            }
        })

        // Handle disconnect
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.user.id}`)
            onlineUsers.delete(socket.user.id)
            io.emit("onlineUsers", Array.from(onlineUsers.keys()))
        })
    })

    return io
}

// Get io instance
exports.getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }
    return io
}

// Get online users
exports.getOnlineUsers = () => {
    return Array.from(onlineUsers.keys())
}

