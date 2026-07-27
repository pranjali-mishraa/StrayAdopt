import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "./ConfirmModel";
import { deletePost,toggleAdoptedStatus } from "./services/editPostsService";

export default function MyPostActions({ post, onDeleted, onStatusChanged }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePost(post._id);
      setShowConfirm(false);
      onDeleted?.(post._id);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleStatus() {
    setTogglingStatus(true);
    try {
      const data = await toggleAdoptedStatus(post._id);
      onStatusChanged?.(post._id, data.post.status);
    } catch (error) {
      console.error(error);
    } finally {
      setTogglingStatus(false);
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/edit-post/${post._id}`)}
          className="flex-1 h-10 border border-border-brand rounded-lg text-sm font-medium text-bark-dark hover:bg-warm transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleToggleStatus}
          disabled={togglingStatus}
          className="flex-1 h-10 border border-sage rounded-lg text-sm font-medium text-sage hover:bg-sage-light transition-colors disabled:opacity-60"
        >
          {post.status === "adopted" ? "Mark Available" : "Mark Adopted"}
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex-1 h-10 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Delete this post?"
        message="This action cannot be undone. The post and its images will be permanently removed."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}