export default function MediaThumb({ item, className = "" }) {
    if (item.mediaType === "video") {
      return (
        <video
          src={`${item.mediaUrl}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          className={`w-full h-full object-cover ${className}`}
        />
      );
    }
    return <img src={item.mediaUrl} alt={item.caption || "NGO update"} className={`w-full h-full object-cover ${className}`} />;
  }