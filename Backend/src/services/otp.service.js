const bcrypt = require("bcryptjs");
const otpModel = require("../models/otp.model");
const { sendOtpEmail } = require("./email.service");

const OTP_EXPIRY_MINUTES = 5;

function generateSixDigitOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


async function createAndSendOtp(email, purpose) {
    await otpModel.deleteMany({ email, purpose }); 

    const otp = generateSixDigitOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await otpModel.create({ email, otpHash, purpose, expiresAt });
    await sendOtpEmail(email, otp, purpose);

    return true;
}

// Verifies a submitted OTP against the stored hash. Throws on failure. Deletes on success (one-time use).
async function verifyOtp(email, submittedOtp, purpose) {
    const record = await otpModel.findOne({ email, purpose }).sort({ createdAt: -1 });

    if (!record) {
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 400;
        throw error;
    }

    if (record.expiresAt < new Date()) {
        await record.deleteOne();
        const error = new Error("OTP has expired, please request a new one");
        error.statusCode = 400;
        throw error;
    }

    const isMatch = await bcrypt.compare(submittedOtp, record.otpHash);
    if (!isMatch) {
        const error = new Error("Invalid OTP");
        error.statusCode = 400;
        throw error;
    }

    await record.deleteOne(); 
    return true;
}

module.exports = { createAndSendOtp, verifyOtp };