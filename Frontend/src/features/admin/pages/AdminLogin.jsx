import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Field from "../../auth/components/FormField";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password.trim()) return setError("All fields are required.");

    setSaving(true);
    try {
      await login(form);
      navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold text-bark-dark mb-2">Admin login</h1>
        <p className="text-text-mid mb-8">Sign in to review NGO verification requests.</p>

        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-border-brand p-8 space-y-4">
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
          <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" />

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-bark-dark text-cream rounded-xl font-medium hover:bg-rust transition-colors disabled:opacity-60"
          >
            {saving ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}