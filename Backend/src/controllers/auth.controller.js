
const authService = require("../services/auth.service");

// STEP 1: Register — creates unverified user and sends OTP
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const { email: registeredEmail } =
            await authService.registerUser({ username, email, password });

        return res.status(200).json({
            message: "OTP sent to your email. Please verify to complete registration.",
            email: registeredEmail,
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}


// STEP 2: Verify registration OTP — returns JWT instead of setting cookie
async function verifyRegistrationOtpController(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
            });
        }

        const { token, user } =
            await authService.verifyRegistrationOtp({ email, otp });

        return res.status(200).json({
            message: "Account verified successfully",
            token,
            user,
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}


// Resend registration OTP
async function resendRegistrationOtpController(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        const result = await authService.resendRegistrationOtp(email);

        return res.status(200).json({
            message: "OTP resent successfully",
            email: result.email,
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}


// Login — returns JWT instead of setting cookie
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const { token, user } =
            await authService.loginUser({ email, password });

        return res.status(200).json({
            message: "User logged in successfully",
            token,
            user,
        });

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
            return res.status(400).json({
                message: "Email is required",
            });
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


// FORGOT PASSWORD — step 2: verify OTP
async function verifyPasswordResetOtpController(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
            });
        }

        const { resetToken } =
            await authService.verifyPasswordResetOtp({ email, otp });

        return res.status(200).json({
            message: "OTP verified",
            resetToken,
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}


// FORGOT PASSWORD — step 3: reset password
async function resetPasswordController(req, res) {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({
                message: "Reset token and new password are required",
            });
        }

        await authService.resetPassword({ resetToken, newPassword });

        return res.status(200).json({
            message: "Password reset successfully. Please log in.",
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}


// Get currently authenticated user
async function getMeController(req, res) {
    return res.status(200).json({
        user: req.user,
    });
}


// Logout — blacklist only the current tab's Bearer token
async function logoutUserController(req, res) {
    try {
        const token = req.authToken;

        if (!token) {
            return res.status(401).json({
                message: "Authentication token missing",
            });
        }

        await authService.logoutUser(token);

        return res.status(200).json({
            message: "Logged out successfully",
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
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
