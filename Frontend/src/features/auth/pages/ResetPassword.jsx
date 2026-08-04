import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useAuthService } from "../hooks/useAuthService";
import { Spinner } from "../components/AuthIcons";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleResetPassword, loading } = useAuthService();

  const resetToken = location.state?.resetToken;
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await handleResetPassword({ resetToken, newPassword });
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }

  if (!resetToken) {
    return (
      <AuthShell mode="login" title="Something went wrong" subtitle="Reset session not found">
        <p className="text-text-light text-sm text-center">
          Please start again from{" "}
          <Link to="/forgot-password" className="text-rust font-medium hover:opacity-75">
            forgot password
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell mode="login" title="Set a new password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-text-mid mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full h-11 px-4 pr-16 border border-border-brand rounded-xl text-[14px] text-text outline-none focus:border-bark focus:ring-2 focus:ring-bark/20 transition-all duration-200 placeholder:text-text-light"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-text-light hover:text-bark transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-text-mid mb-1.5">Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            className="w-full h-11 px-4 border border-border-brand rounded-xl text-[14px] text-text outline-none focus:border-bark focus:ring-2 focus:ring-bark/20 transition-all duration-200 placeholder:text-text-light"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-bark-dark text-cream rounded-xl font-medium text-[15px] flex items-center justify-center gap-2 hover:bg-rust transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? <Spinner /> : "Reset Password"}
        </button>
      </form>
    </AuthShell>
  );
}