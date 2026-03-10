require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const http = require("http")
const cors = require("cors")
const path = require("path")
const authRouter = require("./routes/router")
const socketService = require("./services/socketService")

const app = express()
const server = http.createServer(app)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes (must be before static file serving)
app.use("/api", authRouter)

// Serve static files from frontend in production
app.use(express.static(path.join(__dirname, "../frontend/dist")))

// Handle React routing, return all requests to React app (must be last)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Initialize Socket.io
socketService.initialize(server)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: "Something went wrong!", error: err.message })
})

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err))

// Start Server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

