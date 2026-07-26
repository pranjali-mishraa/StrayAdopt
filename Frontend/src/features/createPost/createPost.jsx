import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../home/services/postService" 

const MAX_IMAGES = 5;

export default function CreatePost() {
  const navigate = useNavigate();

  const [images, setImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // object URLs for display
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleImageChange(e) {
    const files = Array.from(e.target.files);

    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images`);
      return;
    }

    setError("");
    const newImages = [...images, ...files];
    const newPreviews = [...previews, ...files.map((f) => URL.createObjectURL(f))];

    setImages(newImages);
    setPreviews(newPreviews);
    e.target.value = ""; // allow re-selecting the same file if removed
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (images.length === 0) {
      setError("Please add at least one image");
      return;
    }
    if (!description.trim() || !location.trim()) {
      setError("Description and location are required");
      return;
    }

    const formData = new FormData();
    images.forEach((file) => formData.append("images", file));
    formData.append("description", description);
    formData.append("location", location);

    setLoading(true);
    try {
      await createPost(formData);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-semibold text-bark-dark mb-2">
          Post a Stray
        </h1>
        <p className="text-text-mid mb-8">
          Help a stray find a home by sharing their photos and story.
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-brand p-8 space-y-6">
          {/* Image upload */}
          <div>
            <label className="block text-[14px] font-medium text-bark-dark mb-2">
              Photos ({images.length}/{MAX_IMAGES})
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border-brand">
                  <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border-brand flex items-center justify-center cursor-pointer hover:border-rust transition-colors text-text-light text-2xl">
                  +
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[12px] text-text-light">
              Add 1 to {MAX_IMAGES} photos of the animal.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[14px] font-medium text-bark-dark mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Tell us about the animal — breed, temperament, any health notes..."
              className="w-full px-4 py-3 border border-border-brand rounded-xl text-[14px] text-text-main outline-none focus:border-rust focus:ring-2 focus:ring-rust/20 transition-all resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[14px] font-medium text-bark-dark mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Sector 12, Ghaziabad"
              className="w-full h-11 px-4 border border-border-brand rounded-xl text-[14px] text-text-main outline-none focus:border-rust focus:ring-2 focus:ring-rust/20 transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-rust hover:bg-rust-hover disabled:opacity-60 text-white font-medium rounded-xl transition-colors"
          >
            {loading ? "Posting..." : "Post Stray"}
          </button>
        </form>
      </div>
    </div>
  );
}