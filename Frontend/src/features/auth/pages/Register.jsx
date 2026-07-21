import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Field from "../components/FormField";
import { useAuthService } from "../hooks/useAuthService";
import { Spinner } from "../components/AuthIcons";
export default function Register() {
  const { handleRegister, loading } = useAuthService();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    try {
      await handleRegister({ username: form.username, email: form.email, password: form.password });
      navigate("/");
    } catch (err) {
      setServerError(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <AuthShell mode="signup" title="Create your account" subtitle="Join StrayOpt and start making a difference">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field
  label="Username"
  name="username"
  type="text"
  placeholder="riya_sharma"
  value={form.username}
  onChange={handleChange}
  error={errors.username}
  autoComplete="username"
/>

<Field
  label="Email Address"
  name="email"
  type="email"
  placeholder="you@example.com"
  value={form.email}
  onChange={handleChange}
  error={errors.email}
  autoComplete="email"
/>
<div>
  <label className="block text-[13px] font-medium text-text-mid mb-1.5">Password</label>
  <div className="relative">
    <input
      name="password"
      type={showPassword ? "text" : "password"}
      placeholder="Min. 6 characters"
      value={form.password}
      onChange={handleChange}
      autoComplete="new-password"
      className={`w-full h-11 px-4 pr-16 border rounded-xl text-[14px] text-text outline-none transition-all duration-200 placeholder:text-text-light
        ${errors.password ? "border-red-400 ring-2 ring-red-100" : "border-border-brand focus:border-bark focus:ring-2 focus:ring-bark/20"}`}
    />
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-text-light hover:text-bark transition-colors"
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>
  {errors.password && <p className="text-red-500 text-[12px] mt-1">{errors.password}</p>}
</div>

<div>
  <label className="block text-[13px] font-medium text-text-mid mb-1.5">Confirm Password</label>
  <div className="relative">
    <input
      name="confirm"
      type={showConfirm ? "text" : "password"}
      placeholder="Repeat your password"
      value={form.confirm}
      onChange={handleChange}
      autoComplete="new-password"
      className={`w-full h-11 px-4 pr-16 border rounded-xl text-[14px] text-text outline-none transition-all duration-200 placeholder:text-text-light
        ${errors.confirm ? "border-red-400 ring-2 ring-red-100" : "border-border-brand focus:border-bark focus:ring-2 focus:ring-bark/20"}`}
    />
    <button
      type="button"
      onClick={() => setShowConfirm((s) => !s)}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-text-light hover:text-bark transition-colors"
    >
      {showConfirm ? "Hide" : "Show"}
    </button>
  </div>
  {errors.confirm && <p className="text-red-500 text-[12px] mt-1">{errors.confirm}</p>}
</div>

        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-bark-dark text-cream rounded-xl font-medium text-[15px] flex items-center justify-center gap-2 hover:bg-rust transition-all duration-200 hover:shadow-[0_4px_20px_rgba(192,87,42,0.3)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? <Spinner /> : "Sign Up 🐾"}
        </button>

        <p className="text-center text-[14px] text-text-light mt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-rust font-medium hover:opacity-75 transition-opacity">
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}