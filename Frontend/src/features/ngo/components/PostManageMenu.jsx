import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const itemClass = "block w-full text-center py-3.5 text-[15px] border-b border-border-brand transition-colors";

export default function PostManageMenu({ post, busy, onToggleStatus, onDelete }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={busy}
        aria-label="Manage post"
        className={`w-8 h-8 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-colors ${busy ? "animate-pulse" : ""}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Manage post"
            className="w-full max-w-sm bg-white rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Link to={`/pets/${post._id}`} className={`${itemClass} text-bark-dark hover:bg-warm`}>
              View post
            </Link>
            <button
              type="button"
              onClick={() => { setOpen(false); onToggleStatus(post); }}
              className={`${itemClass} text-bark-dark hover:bg-warm`}
            >
              {post.status === "adopted" ? "Mark as available" : "Mark as adopted"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); onDelete(post); }}
              className={`${itemClass} text-red-600 hover:bg-red-50`}
            >
              Delete post
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="block w-full text-center py-3.5 text-[15px] text-text-mid hover:bg-warm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}