const jwt = require("jsonwebtoken")

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        let token = req.header("Authorization")
        
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" })
        }

        // Remove "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length)
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        req.user = decoded
        next()
        
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" })
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" })
        }
        res.status(500).json({ message: "Server error in authentication" })
    }
}

module.exports = authMiddleware

