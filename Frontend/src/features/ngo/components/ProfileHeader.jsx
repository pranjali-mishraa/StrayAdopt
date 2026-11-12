import VerifiedBadge from "./VerifiedBadge";

export default function ProfileHeader({ ngo, stats = [], hasStories = false, onAvatarClick, actions }) {
  return (
    <header className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-12">
      {/* Avatar: a rust ring means active stories, like Instagram */}
      <button
        type="button"
        onClick={hasStories ? onAvatarClick : undefined}
        disabled={!hasStories}
        aria-label={hasStories ? "View stories" : undefined}
        className={`flex-shrink-0 rounded-full p-[3px] ${
          hasStories
            ? "bg-gradient-to-tr from-rust via-[#E08A4F] to-[#F2C28A] cursor-pointer"
            : "bg-border-brand cursor-default"
        }`}
      >
        <span className="block rounded-full bg-cream p-[3px]">
          <img src={ngo.image} alt={ngo.name} className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover" />
        </span>
      </button>

      <div className="flex-1 min-w-0 text-center sm:text-left space-y-4">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <h1 className="font-display text-2xl font-semibold text-bark-dark break-words">{ngo.name}</h1>
          {ngo.verificationStatus === "verified" && <VerifiedBadge />}
        </div>

        {actions && <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">{actions}</div>}

        <ul className="flex justify-center sm:justify-start gap-8">
          {stats.map((s) => (
            <li key={s.label} className="text-[15px] text-text-mid">
              <span className="font-semibold text-bark-dark">{s.value}</span> {s.label}
            </li>
          ))}
        </ul>

        <div className="space-y-1">
          <p className="text-[15px] text-text-main leading-relaxed whitespace-pre-line">{ngo.description}</p>
          {ngo.address && <p className="text-[14px] text-text-light">{ngo.address}</p>}
        </div>
      </div>
    </header>
  );
}