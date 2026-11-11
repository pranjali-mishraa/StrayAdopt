
import { useContext } from "react";
import { AuthContext } from "../AuthContext";

import {
    login,
    register,
    logout,
    getMe,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword,
} from "../services/authService";

export const useAuthService = () => {
    const { user, setUser, loading, setLoading } = useContext(AuthContext);

    // USER LOGIN
    const handleLogin = async ({ email, password }) => {
        setLoading(true);

        try {
            const data = await login({ email, password });

            // Token is already stored by authService.js
            setUser(data.user);

            return data;
        } finally {
            setLoading(false);
        }
    };

    // USER REGISTRATION
    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);

        try {
            return await register({ username, email, password });
        } finally {
            setLoading(false);
        }
    };

    // USER LOGOUT
    const handleLogout = async () => {
        setLoading(true);

        try {
            await logout();
        } catch (error) {
            console.error("User logout API failed:", error);
        } finally {
            // Clear only this tab's User session
            sessionStorage.removeItem("userToken");
            setUser(null);
            setLoading(false);
        }
    };

    // REGISTRATION OTP
    const handleVerifyRegistrationOtp = async ({ email, otp }) => {
        setLoading(true);

        try {
            const data = await verifyRegistrationOtp({ email, otp });

            // Token is already stored by authService.js
            setUser(data.user);

            return data;
        } finally {
            setLoading(false);
        }
    };

    const handleResendRegistrationOtp = async ({ email }) => {
        return await resendRegistrationOtp({ email });
    };

    // FORGOT PASSWORD
    const handleRequestPasswordResetOtp = async ({ email }) => {
        setLoading(true);

        try {
            return await requestPasswordResetOtp({ email });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPasswordResetOtp = async ({ email, otp }) => {
        setLoading(true);

        try {
            return await verifyPasswordResetOtp({ email, otp });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async ({ resetToken, newPassword }) => {
        setLoading(true);

        try {
            return await resetPassword({ resetToken, newPassword });
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        setUser,
        loading,
        setLoading,
        handleLogin,
        handleLogout,
        handleRegister,
        handleVerifyRegistrationOtp,
        handleResendRegistrationOtp,
        handleRequestPasswordResetOtp,
        handleVerifyPasswordResetOtp,
        handleResetPassword,
    };
};
