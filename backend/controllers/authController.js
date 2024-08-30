const crud = require('../db/model');
const bcryptjs = require('bcryptjs');
const generateTokenAndSetCookie = require('../utils/auth');
const sendVerificationEmail = require('../mailtrap/emails');

const signUp = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // Check for missing fields
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, msg: "Please enter all the fields" });
        }

        // Check if user already exists
        const alreadyExists = await crud.findOne({ email: email });
        if (alreadyExists) {
            return res.status(400).json({ success: false, msg: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Generate verification token
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Create new user
        const newUser = await crud.create({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        // Generate token and set cookie
        generateTokenAndSetCookie(res, newUser._id);

        // Send verification email
        await sendVerificationEmail(newUser.email, verificationToken);

        // Send success response
        return res.status(201).json({
            success: true,
            newUser: {
                ...newUser._doc,
                password: undefined, // Exclude password from response
            },
        });

    } catch (error) {
        console.error('Error in signUp:', error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for missing fields
        if (!email || !password) {
            return res.status(400).json({ success: false, msg: "Please enter all the fields" });
        }

        // Find user
        const alreadyUser = await crud.findOne({ email: email });
        if (!alreadyUser) {
            return res.status(400).json({ success: false, msg: "User does not exist" });
        }

        // Validate password
        const isPasswordValid = await bcryptjs.compare(password, alreadyUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, msg: "Enter correct password" });
        }

        // Generate token and set cookie
        generateTokenAndSetCookie(res, alreadyUser._id);

        // Send success response
        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...alreadyUser._doc,
                password: undefined, // Exclude password from response
            },
        });

    } catch (error) {
        console.error('Error in signIn:', error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    signUp,
    signIn
};
