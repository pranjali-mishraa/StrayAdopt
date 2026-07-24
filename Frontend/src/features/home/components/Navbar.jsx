import { Link, useNavigate } from "react-router-dom";
import { useAuthService } from "../../auth/hooks/useAuthService";

export default function Navbar() {
  const { user, loading } = useAuthService();
  const navigate = useNavigate();

  return (
    <header className="bg-warm border-b border-border-brand sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-rust rounded-xl flex items-center justify-center text-lg">
            🐾
          </div>
          <span className="font-display text-2xl font-bold text-bark-dark tracking-tight">
            Stray<em className="italic text-rust font-normal">Adopt</em>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            to="/"
            className="text-[15px] font-medium text-text-mid hover:text-bark-dark transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-[15px] font-medium text-text-mid hover:text-bark-dark transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-5">
          {!loading && user && (
            <Link
              to="/chats"
              className="text-[15px] font-medium text-text-mid hover:text-bark-dark transition-colors"
            >
              Chats
            </Link>
          )}

          <button
            onClick={() => navigate(user ? "/profile" : "/login")}
            className="w-11 h-11 rounded-full border border-border-brand flex items-center justify-center text-text-mid hover:border-rust hover:text-rust transition-colors overflow-hidden"
            aria-label="Profile"
          >
            {user ? (
              <span className="text-[15px] font-semibold text-bark-dark">
                {user.username?.[0]?.toUpperCase()}
              </span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}