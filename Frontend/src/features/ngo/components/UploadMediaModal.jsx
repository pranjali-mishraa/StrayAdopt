import { useEffect, useRef, useState } from "react";
import { createHighlight } from "../services/ngoService";

const MAX_IMAGE_MB = 10; // matches Cloudinary's free-plan image limit
const MAX_VIDEO_MB = 50; // matches the multer limit on the server
const CAPTION_MAX = 300;

export default function UploadMediaModal({ initialType = "story", onClose, onUploaded }) {
  const [contentType, setContentType] = useState(initialType);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  // Free the preview object URL when it changes or the modal closes
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [saving, onClose]);

  function pickFile(selected) {
    if (!selected) return;

    const isVideo = selected.type.startsWith("video/");
    const isImage = selected.type.startsWith("image/");
    if (!isImage && !isVideo) return setError("Only photos and videos are allowed.");

    const limitMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    if (selected.size > limitMb * 1024 * 1024) {
      return setError(`${isVideo ? "Videos" : "Photos"} can be at most ${limitMb} MB.`);
    }

    setError("");
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    if (!file) return setError("Choose a photo or video first.");

    const data = new FormData();
    data.append("media", file);
    data.append("caption", caption.trim());
    data.append("contentType", contentType);

    setSaving(true);
    setError("");
    try {
      const res = await createHighlight(data);
      onUploaded(res.highlight); // parent closes the modal
    } catch (err) {
      setError(err?.response?.data?.message || "Could not publish. Please try again.");
      setSaving(false);
    }
  }

  const isVideo = file?.type.startsWith("video/");

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={() => !saving && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-brand">
          <h2 id="upload-title" className="font-display text-lg font-semibold text-bark-dark">Add to your profile</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="w-8 h-8 rounded-full text-text-mid hover:bg-warm disabled:opacity-40 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Story or highlight */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-warm rounded-xl">
            {[
              { key: "story", title: "Story", hint: "Disappears after 24 hours" },
              { key: "highlight", title: "Highlight", hint: "Stays on your profile" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setContentType(opt.key)}
                disabled={saving}
                className={`rounded-lg px-3 py-2.5 text-left transition-colors ${
                  contentType === opt.key ? "bg-white shadow-sm" : "hover:bg-white/60"
                }`}
              >
                <span className="block text-sm font-medium text-bark-dark">{opt.title}</span>
                <span className="block text-[12px] text-text-light">{opt.hint}</span>
              </button>
            ))}
          </div>

          {/* Media */}
          {file ? (
            <div className="relative bg-black rounded-xl overflow-hidden flex items-center justify-center max-h-80">
              {isVideo ? (
                <video src={previewUrl} controls muted playsInline className="max-h-80 w-full object-contain" />
              ) : (
                <img src={previewUrl} alt="Preview" className="max-h-80 w-full object-contain" />
              )}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={saving}
                className="absolute top-3 right-3 h-8 px-3 rounded-full bg-black/60 hover:bg-black/75 text-white text-xs font-medium transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-center px-6 transition-colors ${
                dragging ? "border-rust bg-rust/5" : "border-border-brand hover:border-rust"
              }`}
            >
              <span className="text-[15px] font-medium text-bark-dark">Drag a photo or video here</span>
              <span className="text-[13px] text-text-light">
                or click to browse · photos up to {MAX_IMAGE_MB} MB, videos up to {MAX_VIDEO_MB} MB
              </span>
            </button>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ""; }}
          />

          {/* Caption */}
          <div>
            <label className="block text-[13px] font-medium text-text-mid mb-1.5">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={CAPTION_MAX}
              rows={3}
              disabled={saving}
              placeholder="Write a caption..."
              className="w-full px-4 py-3 border border-border-brand rounded-xl text-[14px] outline-none focus:border-rust focus:ring-2 focus:ring-rust/20 resize-none"
            />
            <p className="text-[12px] text-text-light text-right mt-1">{caption.length}/{CAPTION_MAX}</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-border-brand">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 h-11 border border-border-brand rounded-xl font-medium text-bark-dark hover:bg-warm disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !file}
            className="flex-1 h-11 bg-rust hover:bg-rust-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
          >
            {saving ? "Publishing..." : contentType === "story" ? "Share story" : "Add highlight"}
          </button>
        </div>
      </form>
    </div>
  );
}