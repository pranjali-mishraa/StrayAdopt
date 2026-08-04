import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useAuthService } from "../hooks/useAuthService";
import { Spinner } from "../components/AuthIcons";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    handleVerifyRegistrationOtp,
    handleResendRegistrationOtp,
    handleVerifyPasswordResetOtp,
    loading,
  } = useAuthService();

  const mode = location.state?.mode || "register"; // "register" | "reset-password"
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resending, setResending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    try {
      if (mode === "register") {
        await handleVerifyRegistrationOtp({ email, otp });
        navigate("/");
      } else {
        const data = await handleVerifyPasswordResetOtp({ email, otp });
        navigate("/reset-password", { state: { resetToken: data.resetToken, email } });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid or expired OTP");
    }
  }

  async function handleResend() {
    setError("");
    setResendMessage("");
    setResending(true);
    try {
      await handleResendRegistrationOtp({ email });
      setResendMessage("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not resend OTP");
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return (
      <AuthShell mode="login" title="Something went wrong" subtitle="No email found for verification">
        <p className="text-text-light text-sm text-center">
          Please start again from{" "}
          <Link to="/register" className="text-rust font-medium hover:opacity-75">
            registration
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      mode="login"
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${email}`}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-text-mid mb-1.5">
            Verification Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full h-12 px-4 border border-border-brand rounded-xl text-center text-[20px] tracking-[0.3em] font-medium outline-none focus:border-bark focus:ring-2 focus:ring-bark/20 transition-all duration-200"
          />
          {error && <p className="text-red-500 text-[12px] mt-1">{error}</p>}
        </div>

        {resendMessage && (
          <p className="text-sm text-sage bg-sage-light border border-sage/30 rounded-lg px-3 py-2">
            {resendMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-bark-dark text-cream rounded-xl font-medium text-[15px] flex items-center justify-center gap-2 hover:bg-rust transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <Spinner /> : "Verify"}
        </button>

        {mode === "register" && (
          <p className="text-center text-[14px] text-text-light mt-2">
            Didn&apos;t get the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-rust font-medium hover:opacity-75 transition-opacity disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          </p>
        )}
      </form>
    </AuthShell>
  );
}