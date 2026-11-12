import { useState } from "react";
import { Link } from "react-router-dom";
import Field from "../../auth/components/FormField";
import { registerNgo } from "../services/ngoService";





export default function NgoRegister() {
  const [form, setForm] = useState({
    name: "", description: "", email: "", password: "",
    address: "", phone: "", website: "", latitude: "", longitude: "",
  });
  const [image, setImage] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        })),
      () => setError("Could not get your location. Enter the coordinates manually.")
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.description || !form.email || !form.password) {
      return setError("Name, description, email and password are required.");
    }
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (!form.latitude || !form.longitude) return setError("Please add your NGO's location.");
    if (!image) return setError("Please add an NGO profile picture.");
    if (documents.length === 0) return setError("Please upload at least one verification document.");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("image", image);
    documents.forEach((file) => data.append("documents", file));

    setSaving(true);
    try {
      await registerNgo(data);
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="max-w-md bg-white border border-border-brand rounded-2xl p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-bark-dark mb-3">Application submitted</h1>
          <p className="text-text-mid mb-6">
            Your NGO is pending admin approval. You can log in now, but you can publish only after approval.
          </p>
          <Link to="/ngo/login" className="inline-block bg-rust hover:bg-rust-hover text-white font-medium px-6 py-3 rounded-full transition-colors">
            Go to NGO login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-semibold text-bark-dark mb-2">Register your NGO</h1>
        <p className="text-text-mid mb-8">Verified NGOs get a public profile and can post strays for adoption.</p>

        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-border-brand p-8 space-y-5">
          <Field label="NGO Name" name="name" type="text" value={form.name} onChange={handleChange} />

          <div>
            <label className="block text-[13px] font-medium text-text-mid mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-border-brand rounded-xl text-[14px] outline-none focus:border-rust focus:ring-2 focus:ring-rust/20 transition-all resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
            <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
          </div>

          <Field label="Address" name="address" type="text" value={form.address} onChange={handleChange} />

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            <Field label="Website" name="website" type="url" placeholder="https://" value={form.website} onChange={handleChange} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-text-mid">Location</label>
              <button type="button" onClick={useMyLocation} className="text-[13px] text-rust font-medium hover:opacity-75">
                Use my current location
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude"
                className="h-11 px-4 border border-border-brand rounded-xl text-[14px] outline-none focus:border-rust focus:ring-2 focus:ring-rust/20"
              />
              <input
                name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude"
                className="h-11 px-4 border border-border-brand rounded-xl text-[14px] outline-none focus:border-rust focus:ring-2 focus:ring-rust/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-mid mb-1.5">Profile picture</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} className="text-sm" />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-mid mb-1.5">
              Verification documents (registration certificate, etc.)
            </label>
            <input
              type="file" multiple accept="image/*,application/pdf"
              onChange={(e) => setDocuments(Array.from(e.target.files).slice(0, 5))}
              className="text-sm"
            />
            <p className="text-[12px] text-text-light mt-1">Up to 5 files, 5MB each. Images or PDF.</p>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit" disabled={saving}
            className="w-full h-12 bg-rust hover:bg-rust-hover disabled:opacity-60 text-white font-medium rounded-xl transition-colors"
          >
            {saving ? "Submitting..." : "Submit for approval"}
          </button>

          <p className="text-center text-[14px] text-text-light">
            Already registered?{" "}
            <Link to="/ngo/login" className="text-rust font-medium hover:opacity-75">NGO login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}