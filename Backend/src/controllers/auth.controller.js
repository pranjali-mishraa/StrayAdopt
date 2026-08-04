const authService = require("../services/auth.service");

// STEP 1: register — creates unverified user, sends OTP, NO cookie yet
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const { email: registeredEmail } = await authService.registerUser({ username, email, password });

        return res.status(200).json({
            message: "OTP sent to your email. Please verify to complete registration.",
            email: registeredEmail,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

// STEP 2: verify OTP — marks user verified, sets cookie, returns user + logs them in
async function verifyRegistrationOtpController(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const { token, user } = await authService.verifyRegistrationOtp({ email, otp });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({ message: "Account verified successfully", user });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

// Resend OTP for an unverified registration
async function resendRegistrationOtpController(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const result = await authService.resendRegistrationOtp(email);

        return res.status(200).json({ message: "OTP resent successfully", email: result.email });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

// Login — unchanged logic, only verified users can log in
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const { token, user } = await authService.loginUser({ email, password });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({ message: "User logged in successfully", user });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

// FORGOT PASSWORD — step 1: request OTP
async function requestPasswordResetOtpController(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const result = await authService.requestPasswordResetOtp(email);

        return res.status(200).json({
            message: "If an account exists with this email, an OTP has been sent.",
            email: result.email,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

// FORGOT PASSWORD — step 2: verify OTP, get a short-lived reset token
async function verifyPasswordResetOtpController(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const { resetToken } = await authService.verifyPasswordResetOtp({ email, otp });

        return res.status(200).json({ message: "OTP verified", resetToken });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

// FORGOT PASSWORD — step 3: set new password using the reset token
async function resetPasswordController(req, res) {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: "Reset token and new password are required" });
        }

        await authService.resetPassword({ resetToken, newPassword });

        return res.status(200).json({ message: "Password reset successfully. Please log in." });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

async function getMeController(req, res) {
    return res.status(200).json({ user: req.user });
}

async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token;
        await authService.logoutUser(token);
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}

module.exports = {
    registerUserController,
    verifyRegistrationOtpController,
    resendRegistrationOtpController,
    loginUserController,
    requestPasswordResetOtpController,
    verifyPasswordResetOtpController,
    resetPasswordController,
    getMeController,
    logoutUserController,
};