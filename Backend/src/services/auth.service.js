const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const blacklistTokenModel = require("../models/blacklistToken.model");
const { createAndSendOtp, verifyOtp } = require("./otp.service");

async function registerUser({ username, email, password }) {
    const existingUser = await userModel.findOne({ email });

    if (existingUser && existingUser.isVerified) {
        const error = new Error("User already exists with this email");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser && !existingUser.isVerified) {
        // User started registering before but never verified — update their details, resend OTP
        existingUser.username = username;
        existingUser.password = hashedPassword;
        await existingUser.save();
    } else {
        await userModel.create({ username, email, password: hashedPassword });
    }

    await createAndSendOtp(email, "register");

    return { email };
}


async function verifyRegistrationOtp({ email, otp }) {
    await verifyOtp(email, otp, "register");

    const user = await userModel.findOneAndUpdate(
        { email },
        { isVerified: true },
        { new: true }
    );

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: { _id: user._id, username: user.username, email: user.email },
    };
}

// Resend OTP for an unverified registration.
async function resendRegistrationOtp(email) {
    const user = await userModel.findOne({ email });

    if (!user) {
        const error = new Error("No pending registration found for this email");
        error.statusCode = 404;
        throw error;
    }
    if (user.isVerified) {
        const error = new Error("This account is already verified, please login");
        error.statusCode = 400;
        throw error;
    }

    await createAndSendOtp(email, "register");
    return { email };
}

// FORGOT PASSWORD — step 1: request OTP
async function requestPasswordResetOtp(email) {
    const user = await userModel.findOne({ email });

    if (!user) {
        // Deliberately vague — don't reveal whether an email is registered
        return { email };
    }

    await createAndSendOtp(email, "reset-password");
    return { email };
}
// FORGOT PASSWORD — step 2: verify OTP, issue a short-lived reset token
async function verifyPasswordResetOtp({ email, otp }) {
    await verifyOtp(email, otp, "reset-password");

    const resetToken = jwt.sign(
        { email, purpose: "reset-password" },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
    );

    return { resetToken };
}

// FORGOT PASSWORD — step 3: set new password, requires the reset token from step 2
async function resetPassword({ resetToken, newPassword }) {
    let decoded;
    try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
        const error = new Error("Reset session expired or invalid, please start again");
        error.statusCode = 400;
        throw error;
    }

    if (decoded.purpose !== "reset-password") {
        const error = new Error("Invalid reset token");
        error.statusCode = 400;
        throw error;
    }

    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return true;
}


async function loginUser({ email, password }) {
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        throw error;
    }

    if (!user.isVerified) {
        const error = new Error("Please verify your email before logging in");
        error.statusCode = 403;
        throw error;
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        throw error;
    }

    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: { _id: user._id, username: user.username, email: user.email },
    };
}

async function logoutUser(token){

    if(!token){
      const error = new Error("token not provided")
      error.statusCode = 400 
      throw error;
    }

        const decoded = jwt.decode(token); 
        await blacklistTokenModel.create({
            token,
            expiresAt: new Date(decoded.exp * 1000), 
        });
    
}

// special function for middleware 
async function isTokenBlacklisted(token) {
    const found = await blacklistTokenModel.findOne({ token });
    return !!found;
}

module.exports = { registerUser, loginUser  , logoutUser , isTokenBlacklisted ,verifyRegistrationOtp,resendRegistrationOtp,
    requestPasswordResetOtp,verifyPasswordResetOtp , resetPassword
  };


// const token = jwt.sign(
//     { id: user._id, email: user.email },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
// );