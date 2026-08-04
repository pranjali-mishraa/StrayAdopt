import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Field from "../components/FormField";
import { useAuthService } from "../hooks/useAuthService";
import { Spinner } from "../components/AuthIcons";

export default function ForgotPassword() {
  const { handleRequestPasswordResetOtp, loading } = useAuthService();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      await handleRequestPasswordResetOtp({ email });
      navigate("/verify-otp", { state: { mode: "reset-password", email } });
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <AuthShell
      mode="login"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a code to reset it"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          autoComplete="email"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-bark-dark text-cream rounded-xl font-medium text-[15px] flex items-center justify-center gap-2 hover:bg-rust transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? <Spinner /> : "Send Reset Code"}
        </button>

        <p className="text-center text-[14px] text-text-light mt-2">
          Remembered your password?{" "}
          <Link to="/login" className="text-rust font-medium hover:opacity-75 transition-opacity">
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}