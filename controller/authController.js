const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const User = require("../model/AuthSchema")

const authController = {
    register: async (req, res) => {
        try {
            const { name, email, phone, password, role } = req.body
            if (!name || !email || !phone || !password) {
                return res.status(400).send("enter all credentials")
            }

            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).send("user already existing")
            }

            // Hash password
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            // Create new user
            const newUser = new User({
                name,
                email,
                phone,
                password: hashedPassword,
                role
            })
            await newUser.save()

            // Generate JWT token
            const token = jwt.sign(
                { id: newUser._id, email: newUser.email, role: newUser.role },
                process.env.JWT_KEY,
                { expiresIn: "1d" }
            )

            res.status(201).json({
                message: "User registered successfully",
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            })
        } catch (error) {
            res.status(500).send("Server error: " + error.message)
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                return res.status(400).send("enter all credentials")
            }

            const existingUser = await User.findOne({ email })
            if (!existingUser) {
                return res.status(404).send("User does not exist")
            }

            // Compare password (plain password first, then hashed password)
            const isMatch = await bcrypt.compare(password, existingUser.password)

            if (!isMatch) {
                return res.status(400).send("enter the correct password")
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: existingUser._id, email: existingUser.email, role: existingUser.role },
                process.env.JWT_KEY,
                { expiresIn: "1d" }
            )

            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    role: existingUser.role
                }
            })
        } catch (error) {
            res.status(500).send("Server error: " + error.message)
        }
    }
}

module.exports = authController

