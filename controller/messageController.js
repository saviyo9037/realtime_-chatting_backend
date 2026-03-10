const Message = require("../model/messageSchema")

const messageController = {
    // Send a message via REST API
    sendMessage: async (req, res) => {
        try {
            const { receiverId, message } = req.body
            const senderId = req.user.id

            // Create and save message
            const newMessage = new Message({
                sender: senderId,
                receiver: receiverId,
                message: message
            })
            await newMessage.save()

            // Try to send real-time notification via Socket.io
            try {
                const socketService = require("../services/socketService")
                const io = socketService.getIO()
                
                // Send to receiver's room
                io.to(`user_${receiverId}`).emit("newMessage", {
                    sender: senderId,
                    message: message,
                    timestamp: newMessage.timestamp
                })
            } catch (socketError) {
                console.log("Socket not available, message saved only")
            }

            res.status(201).json({
                success: true,
                message: newMessage
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },

    // Get conversation between two users
    getConversation: async (req, res) => {
        try {
            const { userId } = req.params
            const currentUserId = req.user.id

            const messages = await Message.find({
                $or: [
                    { sender: currentUserId, receiver: userId },
                    { sender: userId, receiver: currentUserId }
                ]
            }).sort({ timestamp: 1 })

            res.json(messages)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },

    // Get all conversations (latest message from each)
    getAllConversations: async (req, res) => {
        try {
            const userId = req.user.id

            const conversations = await Message.aggregate([
                {
                    $match: {
                        $or: [{ sender: userId }, { receiver: userId }]
                    }
                },
                {
                    $sort: { timestamp: -1 }
                },
                {
                    $group: {
                        _id: {
                            $cond: {
                                if: { $eq: ["$sender", userId] },
                                then: "$receiver",
                                else: "$sender"
                            }
                        },
                        lastMessage: { $first: "$$ROOT" },
                        unreadCount: {
                            $sum: {
                                $cond: [
                                    { $and: [{ $eq: ["$receiver", userId] }, { $eq: ["$read", false] }] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $project: {
                        "_id": 1,
                        "lastMessage.message": 1,
                        "lastMessage.timestamp": 1,
                        "unreadCount": 1,
                        "user.name": 1,
                        "user.email": 1
                    }
                }
            ])

            res.json(conversations)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },

    // Mark messages as read
    markAsRead: async (req, res) => {
        try {
            const { senderId } = req.body
            const receiverId = req.user.id

            await Message.updateMany(
                { sender: senderId, receiver: receiverId, read: false },
                { read: true }
            )

            res.json({ success: true })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}

module.exports = messageController

