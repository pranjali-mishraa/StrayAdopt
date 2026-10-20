import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PetCard from "../../Components/PetCard"
import { useNgoAuth } from "../hooks/useNgoAuth";
import { createHighlight, getMyNgoPosts } from "../services/ngoService";

function HighlightForm({ disabled }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [contentType, setContentType] = useState("highlight");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setMessage({ type: "", text: "" });

    if (!file) return setMessage({ type: "error", text: "Please choose an image or video." });

    const data = new FormData();
    data.append("media", file);
    data.append("caption", caption);
    data.append("contentType", contentType);

    setSaving(true);
    try {
      await createHighlight(data);
      formEl.reset();
      setFile(null);
      setCaption("");
      setMessage({ type: "success", text: contentType === "story" ? "Story published for 24 hours." : "Highlight published." });
    } catch (err) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Could not publish." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border-brand rounded-2xl p-6 space-y-4">
      <h2 className="font-display text-xl font-semibold text-bark-dark">Publish a highlight or story</h2>

      <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files[0] || null)} disabled={disabled} className="text-sm" />

      <textarea
        value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} rows={2} disabled={disabled}
        placeholder="Add a caption..."
        className="w-full px-4 py-3 border border-border-brand rounded-xl text-[14px] outline-none focus:border-rust focus:ring-2 focus:ring-rust/20 resize-none"
      />

      <select
        value={contentType} onChange={(e) => setContentType(e.target.value)} disabled={disabled}
        className="h-11 px-3 border border-border-brand rounded-xl text-[14px] bg-white"
      >
        <option value="highlight">Highlight (permanent)</option>
        <option value="story">Story (disappears after 24 hours)</option>
      </select>

      {message.text && (
        <p className={`text-sm rounded-lg px-3 py-2 border ${message.type === "error" ? "text-red-600 bg-red-50 border-red-100" : "text-bark-dark bg-sage-light border-sage/30"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit" disabled={disabled || saving}
        className="h-11 px-6 bg-rust hover:bg-rust-hover text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Publishing..." : "Publish"}
      </button>
    </form>
  );
}

export default function NgoDashboard() {
  const { ngo, logout } = useNgoAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const isVerified = ngo?.verificationStatus === "verified";

  useEffect(() => {
    getMyNgoPosts()
      .then((data) => setPosts(data.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/ngo/login");
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="bg-white border border-border-brand rounded-2xl p-6 flex flex-wrap items-center gap-5">
          <img src={ngo?.image} alt={ngo?.name} className="w-20 h-20 rounded-full object-cover border border-border-brand" />
          <div className="flex-1 min-w-[200px]">
            <h1 className="font-display text-2xl font-semibold text-bark-dark">{ngo?.name}</h1>
            <span className={`inline-block mt-1 text-[12px] uppercase tracking-wide px-3 py-1 rounded-full ${isVerified ? "bg-sage-light text-bark-dark" : "bg-warm text-bark-dark"}`}>
              {isVerified ? "Verified" : "Pending approval"}
            </span>
          </div>
          <div className="flex gap-3">
            {isVerified && (
              <Link to={`/ngos/${ngo._id}`} className="h-10 px-5 inline-flex items-center border border-border-brand rounded-lg text-sm font-medium text-bark-dark hover:bg-warm transition-colors">
                Public profile
              </Link>
            )}
            <button onClick={handleLogout} className="h-10 px-5 border border-rust text-rust rounded-lg text-sm font-medium hover:bg-rust hover:text-white transition-colors">
              Logout
            </button>
          </div>
        </div>

        {!isVerified && (
          <p className="bg-warm border border-border-brand rounded-xl px-5 py-4 text-text-mid text-[15px]">
            Your NGO is awaiting admin approval. You can publish posts, highlights and stories once it is approved.
          </p>
        )}

        <HighlightForm disabled={!isVerified} />

        {/* Posts */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-bark-dark">Your adoption posts</h2>
            {isVerified && (
              <Link to="/ngo/create-post" className="bg-rust hover:bg-rust-hover text-white font-medium px-6 py-3 rounded-full transition-colors">
                Post a stray
              </Link>
            )}
          </div>

          {loadingPosts ? (
            <p className="text-text-light">Loading...</p>
          ) : posts.length === 0 ? (
            <p className="text-text-mid bg-white border border-border-brand rounded-2xl p-8 text-center">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PetCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}