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

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      setUser(data.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
        const data = await register({ username, email, password });
        return data; 
    } catch (error) {
        throw error;
    } finally {
        setLoading(false);
    }
};

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistrationOtp = async ({ email, otp }) => {
    setLoading(true);
    try {
        const data = await verifyRegistrationOtp({ email, otp });
        setUser(data.user); 
        return data;
    } catch (error) {
        throw error;
    } finally {
        setLoading(false);
    }
};

const handleResendRegistrationOtp = async ({ email }) => {
    try {
        return await resendRegistrationOtp({ email });
    } catch (error) {
        throw error;
    }
};

const handleRequestPasswordResetOtp = async ({ email }) => {
    setLoading(true);
    try {
        return await requestPasswordResetOtp({ email });
    } catch (error) {
        throw error;
    } finally {
        setLoading(false);
    }
};

const handleVerifyPasswordResetOtp = async ({ email, otp }) => {
    setLoading(true);
    try {
        return await verifyPasswordResetOtp({ email, otp });
    } catch (error) {
        throw error;
    } finally {
        setLoading(false);
    }
};

const handleResetPassword = async ({ resetToken, newPassword }) => {
    setLoading(true);
    try {
        return await resetPassword({ resetToken, newPassword });
    } catch (error) {
        throw error;
    } finally {
        setLoading(false);
    }
};

  return { user, setUser , loading,setLoading, handleLogin, handleLogout, handleRegister,
    handleVerifyRegistrationOtp,handleResendRegistrationOtp, handleRequestPasswordResetOtp,handleVerifyPasswordResetOtp,
    handleResetPassword
   };
};