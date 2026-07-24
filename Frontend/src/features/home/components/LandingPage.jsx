import { Link } from "react-router-dom"

export default function LandingPage(){

return(
<section className="relative min-h-[calc(100vh-80px)] flex items-center overflow-hidden bg-warm">
        {/* Left content */}
        <div className="relative z-10 w-full max-w-xl px-8 md:px-16 lg:px-24">
          <p className="text-rust text-[13px] font-medium uppercase tracking-widest mb-4">
            🐾 Find your new best friend
          </p>

          <h1 className="font-display text-[clamp(2.8rem,5vw,4.2rem)] font-semibold text-bark-dark leading-[1.1] mb-4">
            Ready to{" "}
            <span className="relative inline-block">
              Adopt!
              <svg
                viewBox="0 0 200 12"
                className="absolute -bottom-2 left-0 w-full"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0,8 C50,0 100,12 150,4 C175,0 190,8 200,6"
                  stroke="#C0572A"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-text-mid text-[16px] leading-relaxed mb-10 max-w-md">
            Every stray deserves a warm home and a loving family. Browse animals
            posted by caring people in your community and give one a forever home.
          </p>

          <Link
            to="/pets"
            className="inline-flex items-center gap-3 bg-rust text-cream px-8 py-4 rounded-full text-[15px] font-medium shadow-[0_4px_20px_rgba(192,87,42,0.35)] transition-all duration-300 hover:bg-rust-hover hover:shadow-[0_6px_28px_rgba(192,87,42,0.45)] hover:-translate-y-0.5 active:scale-95"
          >
            View Available Pets
            <span className="bg-white/20 rounded-full p-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>

          <div className="flex items-center gap-8 mt-12 pt-8 border-t border-border-brand">
            {[
              { num: "1,240", label: "Animals Posted" },
              { num: "890", label: "Adopted" },
              { num: "3.4k", label: "Members" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-[1.6rem] font-semibold text-bark-dark leading-none">
                  {s.num}
                </p>
                <p className="text-[12px] text-text-light mt-1 uppercase tracking-wide">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — hero image */}
        <div className="absolute right-0 top-0 bottom-0 w-[55%] hidden md:block">
          <img
            src="/Landing_page.png"
            alt="A happy dog ready for adoption"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-warm to-transparent" />
        </div>

        {/* Wave at the bottom */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
              fill="#FDF6EE"
            />
          </svg>
        </div>
      </section>
)

    
}