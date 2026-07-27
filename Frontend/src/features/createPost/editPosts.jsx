import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById } from "../home/services/postService";
import { updateDescription, updateImages, updateLocation } from "./services/editPostsService";

const MAX_IMAGES = 5;

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const [originalDescription, setOriginalDescription] = useState("");
  const [originalLocation, setOriginalLocation] = useState("");
  const [originalImages, setOriginalImages] = useState([]);

  useEffect(() => {
    async function fetchPost() {
      try {
        const data = await getPostById(id);
        setDescription(data.post.description);
        setLocation(data.post.location);
        setExistingImages(data.post.images);

        // capture originals for diffing later
        setOriginalDescription(data.post.description);
        setOriginalLocation(data.post.location);
        setOriginalImages(data.post.images);
      } catch (err) {
        setError("Could not load this post.");
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const totalImages = existingImages.length + newImages.length;

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    if (totalImages + files.length > MAX_IMAGES) {
      setError(`You can have a maximum of ${MAX_IMAGES} images`);
      return;
    }
    setError("");
    setNewImages((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeExistingImage(index) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewImage(index) {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (totalImages === 0) {
      setError("Please keep or add at least one image");
      return;
    }
    if (!description.trim() || !location.trim()) {
      setError("Description and location are required");
      return;
    }

    setSaving(true);
    try {
      const requests = [];

      if (description !== originalDescription) {
        requests.push(updateDescription(id, description));
      }
      if (location !== originalLocation) {
        requests.push(updateLocation(id, location));
      }
      if (
        newImages.length > 0 ||
        existingImages.length !== originalImages.length
      ) {
        const formData = new FormData();
        newImages.forEach((file) => formData.append("images", file));
        formData.append("keepImages", JSON.stringify(existingImages));
        requests.push(updateImages(id, formData));
      }

      if (requests.length === 0) {
        // nothing changed, just go back
        navigate(`/pets/${id}`);
        return;
      }

      await Promise.all(requests);
      navigate(`/pets/${id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-text-mid">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-semibold text-bark-dark mb-2">Edit Post</h1>
        <p className="text-text-mid mb-8">Update your post's details.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-brand p-8 space-y-6">
          <div>
            <label className="block text-[14px] font-medium text-bark-dark mb-2">
              Photos ({totalImages}/{MAX_IMAGES})
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
              {existingImages.map((src, i) => (
                <div key={`existing-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-border-brand">
                  <img src={src} alt={`existing-${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {newPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-border-brand">
                  <img src={src} alt={`new-${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {totalImages < MAX_IMAGES && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border-brand flex items-center justify-center cursor-pointer hover:border-rust transition-colors text-text-light text-2xl">
                  +
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-medium text-bark-dark mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-border-brand rounded-xl text-[14px] text-text-main outline-none focus:border-rust focus:ring-2 focus:ring-rust/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-[14px] font-medium text-bark-dark mb-1.5">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-11 px-4 border border-border-brand rounded-xl text-[14px] text-text-main outline-none focus:border-rust focus:ring-2 focus:ring-rust/20 transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-rust hover:bg-rust-hover disabled:opacity-60 text-white font-medium rounded-xl transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}