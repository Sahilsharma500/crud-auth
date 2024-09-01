const crud = require('../db/model');
const bcryptjs = require('bcryptjs');
const generateTokenAndSetCookie = require('../utils/auth');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } = require('../mailtrap/emails');
const crypto = require('crypto')

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

        alreadyUser.lastLogin = new Date();
		await alreadyUser.save();

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

const verifyEmail = async (req, res) => {
    const { code } = req.body;  // Destructure code from the request body
    
    try {
        // Find the user with the matching verificationToken and check if the token is not expired
        const correctUser = await crud.findOne({
            verificationToken: code,  
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        // If no user found, send error response
        if (!correctUser) {
            return res.status(400).json({ success: false, msg: "The code you are entering is either wrong or expired." });
        }

        // Mark user as verified and clear the verification token and expiration
        correctUser.isVerified = true;
        correctUser.verificationToken = undefined;
        correctUser.verificationTokenExpiresAt = undefined;

        // Save the updated user
        await correctUser.save();


        await sendWelcomeEmail(correctUser.email, correctUser.name);

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...correctUser._doc,
                password: undefined, // Exclude password from response
            },
        });

    } catch (error) {
        console.error('Error in verifyEmail:', error);
        return res.status(500).json({ success: false, msg: "Server error" });
    }
};
const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

const forgetPassword = async(req,res)=> {
    const {email} = req.body;
    try{
        const checkUser = await crud.findOne({email});
        if(!checkUser){
            return res.status(400).json({success:"false", msg:"No User found."});
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

        checkUser.resetPasswordToken = resetToken;
		checkUser.resetPasswordExpiresAt = resetTokenExpiresAt;

        await checkUser.save();

        await sendPasswordResetEmail(checkUser.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    }catch(error){
        console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
    }
}

const resetPassword = async(req, res) => {
    try{
        const { token } = req.params;
		const { password } = req.body;

		const user = await crud.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: "false", message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
    }catch(error){
        console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
    }
}

const checkAuth = async (req, res) => {
	try {
		const user = await crud.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};


module.exports = {
    signUp,
    signIn,
    logout,
    verifyEmail,
    forgetPassword,
    resetPassword,
    checkAuth
};
