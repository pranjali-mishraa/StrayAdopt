import { useCallback, useEffect, useState } from "react";

const IMAGE_DURATION_MS = 5000;

function timeLeft(expiresAt) {
  const ms = new Date(expiresAt) - Date.now();
  if (ms <= 0) return "";
  const h = Math.floor(ms / 36e5);
  return h >= 1 ? `${h}h left` : `${Math.max(1, Math.ceil(ms / 6e4))}m left`;
}

export default function MediaViewer({ items, startIndex = 0, ngo, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [muted, setMuted] = useState(true);
  const item = items[index];

  const next = useCallback(() => {
    if (index >= items.length - 1) onClose();
    else setIndex(index + 1);
  }, [index, items.length, onClose]);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Images auto-advance; videos advance when they end
  useEffect(() => {
    if (!item || item.mediaType === "video") return undefined;
    const timer = setTimeout(next, IMAGE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [item, next]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [next, prev, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="relative w-full sm:max-w-[420px] h-full sm:h-[min(92vh,780px)] bg-black sm:rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress segments */}
        <div className="absolute top-3 inset-x-3 z-20 flex gap-1">
          {items.map((it, i) => (
            <span key={it._id} className="h-[3px] flex-1 rounded-full bg-white/30 overflow-hidden">
              {i < index && <span className="block h-full w-full bg-white" />}
              {i === index &&
                (item.mediaType === "video" ? (
                  <span className="block h-full w-full bg-white/80" />
                ) : (
                  <span
                    className="block h-full bg-white"
                    style={{ animation: `story-progress ${IMAGE_DURATION_MS}ms linear forwards` }}
                  />
                ))}
            </span>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-7 inset-x-3 z-20 flex items-center gap-3">
          <img src={ngo.image} alt={ngo.name} className="w-9 h-9 rounded-full object-cover border border-white/40" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{ngo.name}</p>
            {item.contentType === "story" && <p className="text-white/70 text-[11px]">{timeLeft(item.expiresAt)}</p>}
          </div>
          {item.mediaType === "video" && (
            <button
              onClick={() => setMuted((m) => !m)}
              className="text-white text-xs bg-white/15 hover:bg-white/25 rounded-full px-3 h-8 transition-colors"
            >
              {muted ? "Unmute" : "Mute"}
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Media */}
        <div className="absolute inset-0 flex items-center justify-center">
          {item.mediaType === "video" ? (
            <video
              key={item._id}
              src={item.mediaUrl}
              autoPlay
              playsInline
              muted={muted}
              onEnded={next}
              className="w-full h-full object-contain"
            />
          ) : (
            <img key={item._id} src={item.mediaUrl} alt={item.caption || "NGO update"} className="w-full h-full object-contain" />
          )}
        </div>

        {/* Tap zones */}
        <button aria-label="Previous" onClick={prev} className="absolute left-0 top-20 bottom-24 w-1/3 z-10" />
        <button aria-label="Next" onClick={next} className="absolute right-0 top-20 bottom-24 w-1/3 z-10" />

        {item.caption && (
          <div className="absolute bottom-0 inset-x-0 z-20 p-5 pt-16 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-[15px] leading-relaxed">{item.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}