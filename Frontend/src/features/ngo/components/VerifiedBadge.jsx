export default function VerifiedBadge({ className = "" }) {
    return (
      <span
        title="Verified NGO"
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-rust text-white flex-shrink-0 ${className}`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
    );
  }