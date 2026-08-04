const {Router} = require('express');
const authController = require('../controllers/auth.controller')
const protect = require('../middlewares/auth.middleware')

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user (creates unverified account, sends OTP)
 * @access Public
 */
authRouter.post('/register', authController.registerUserController);

/**
 * @route POST /api/auth/verify-registration-otp
 * @description Verify OTP to complete registration, marks account verified, logs user in
 * @access Public
 */
authRouter.post('/verify-registration-otp', authController.verifyRegistrationOtpController);

/**
 * @route POST /api/auth/resend-registration-otp
 * @description Resend OTP for an unverified registration
 * @access Public
 */
authRouter.post('/resend-registration-otp', authController.resendRegistrationOtpController);

/**
 * @route POST /api/auth/login
 * @description Login a user with email and password (must be verified)
 * @access Public 
 */
authRouter.post('/login', authController.loginUserController);

/**
 * @route POST /api/auth/forgot-password/request-otp
 * @description Request an OTP to reset password
 * @access Public
 */
authRouter.post('/forgot-password/request-otp', authController.requestPasswordResetOtpController);

/**
 * @route POST /api/auth/forgot-password/verify-otp
 * @description Verify password reset OTP, returns a short-lived reset token
 * @access Public
 */
authRouter.post('/forgot-password/verify-otp', authController.verifyPasswordResetOtpController);

/**
 * @route POST /api/auth/forgot-password/reset
 * @description Set a new password using the reset token from verify-otp
 * @access Public
 */
authRouter.post('/forgot-password/reset', authController.resetPasswordController);

/**
 * @route GET /api/auth/me
 * @description get user details of self when user clicks on profile
 * @access Private
 */
authRouter.get('/me', protect, authController.getMeController)

/**
 * @route POST /api/auth/logout
 * @description logout user clear the cookie and add to blacklistSchema
 * @access Private
 */
authRouter.post('/logout', protect, authController.logoutUserController)

module.exports = authRouter