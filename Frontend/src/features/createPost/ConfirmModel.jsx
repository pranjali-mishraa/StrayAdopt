export default function ConfirmModal({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel, loading }) {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onCancel}>
        <div
          className="bg-white rounded-2xl p-6 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-display text-xl font-semibold text-bark-dark mb-2">{title}</h3>
          <p className="text-text-mid text-[15px] mb-6">{message}</p>
  
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 h-11 border border-border-brand rounded-xl text-bark-dark font-medium hover:bg-warm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-medium transition-colors"
            >
              {loading ? "Deleting..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }