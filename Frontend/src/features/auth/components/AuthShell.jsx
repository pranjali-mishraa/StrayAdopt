import { Link } from "react-router-dom";

export default function AuthShell({ mode, title, subtitle, children }) {
  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-bark-dark relative overflow-hidden px-12 py-14">
        <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] bg-rust/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[260px] h-[260px] bg-bark/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-rust/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />

        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-[36px] h-[36px] bg-rust rounded-[10px] flex items-center justify-center text-[18px]">🐾</div>
          <span className="font-display text-[22px] font-semibold text-cream tracking-tight">
            Stray<em className="italic text-rust">Opt</em>
          </span>
        </Link>

        <div className="relative z-10">
          <div className="text-[72px] mb-6 animate-float inline-block">🐾</div>
          <h2 className="font-display text-[2.2rem] font-light text-cream leading-tight mb-4">
            Give a stray<br /><em className="italic text-rust">a reason to wag</em>
          </h2>
          <p className="text-cream/60 text-[14px] leading-relaxed mb-10 max-w-[300px]">
            Join thousands of caring people helping stray animals find their forever homes.
          </p>
          <div className="flex gap-8">
            {[
              { num: "1,240", label: "Animals Posted" },
              { num: "890", label: "Adopted" },
              { num: "3.4k", label: "Members" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-[1.6rem] font-semibold text-cream">{s.num}</p>
                <p className="text-[11px] text-cream/40 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-l-2 border-rust pl-4">
          <p className="font-display italic text-[13px] text-cream/60 leading-relaxed">
            "Until one has loved an animal, a part of one's soul remains unawakened."
          </p>
          <p className="text-[11px] text-cream/30 mt-1">— Anatole France</p>
        </div>
      </div>

      {/* Right form side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute bottom-[-40px] right-[-40px] text-[200px] opacity-[0.03] select-none pointer-events-none rotate-12">🐾</div>

        <div className="w-full max-w-[420px] relative z-10">
          <div className="flex bg-warm rounded-2xl p-1 mb-8 border border-border-brand">
            <Link
              to="/login"
              className={`flex-1 text-center py-2.5 rounded-xl text-[14px] font-medium transition-all duration-300 ${
                isLogin ? "bg-bark-dark text-cream shadow-md" : "text-text-mid hover:text-bark"
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`flex-1 text-center py-2.5 rounded-xl text-[14px] font-medium transition-all duration-300 ${
                !isLogin ? "bg-bark-dark text-cream shadow-md" : "text-text-mid hover:text-bark"
              }`}
            >
              Sign Up
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-[2rem] font-semibold text-bark-dark leading-tight">{title}</h1>
            <p className="text-text-light text-[14px] mt-1">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}