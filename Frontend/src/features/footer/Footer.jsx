import React from "react";
import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";
export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white px-6 md:px-16 pt-16 pb-8">

      {/* ── Top grid ── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">

        {/* ── Col 1: Brand + quote ── */}
        <div className="lg:col-span-1">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-4">
          <div className="w-[36px] h-[36px] bg-rust rounded-[10px] flex items-center justify-center text-cream">
            <PawPrint size={18} />
          </div>
          <span className="font-display text-[22px] font-semibold text-bark-dark tracking-tight">
            Stray<em className="italic text-rust">Adopt</em>
          </span>
          </div>

          <p className="text-[13px] text-white/50 leading-relaxed mb-6">
            A community-driven platform connecting stray animals with loving
            families across India.
          </p>

          {/* Quote */}
          <div className="border-l-2 border-rust pl-4">
            <p className="font-display italic text-[14px] text-white/70 leading-relaxed">
              "Until one has loved an animal, a part of one's soul remains unawakened."
            </p>
            <p className="text-[11px] text-white/30 mt-1.5">— Anatole France</p>
          </div>
        </div>

        {/* ── Col 2: Dogs ── */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">🐕</span>
            <h4 className="font-display text-[15px] font-semibold text-white">
              Dogs for Adoption
            </h4>
          </div>
          <ul className="space-y-2.5">
            {[
              "Indie / Street Dogs",
              "Labrador Mix",
              "Spitz & Pomeranian",
              "Golden Retriever Mix",
              "Beagle Mix",
              "Puppies Available",
            ].map(item => (
              <li key={item}>
                <Link
                  to="/pets"
                  className="text-[13px] text-white/50 hover:text-rust transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-rust transition-colors duration-200" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Col 3: Cats & Others ── */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">🐈</span>
            <h4 className="font-display text-[15px] font-semibold text-white">
              Cats & Others
            </h4>
          </div>
          <ul className="space-y-2.5 mb-8">
            {[
              "Tabby Cats",
              "Persian Mix",
              "Kittens Available",
              "Orange Tabbies",
              "Street Cats",
            ].map(item => (
              <li key={item}>
                <Link
                  to="/pets"
                  className="text-[13px] text-white/50 hover:text-rust transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-rust transition-colors duration-200" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🐰</span>
            <h4 className="font-display text-[15px] font-semibold text-white">
              Other Animals
            </h4>
          </div>
          <ul className="space-y-2.5">
            {["Rabbits", "Birds", "Guinea Pigs"].map(item => (
              <li key={item}>
                <Link
                  to="/pets"
                  className="text-[13px] text-white/50 hover:text-rust transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-rust transition-colors duration-200" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Col 4: Quick links + Social ── */}
        <div>
          <h4 className="font-display text-[15px] font-semibold text-white mb-5">
            Quick Links
          </h4>
          <ul className="space-y-2.5 mb-8">
                        {[
            { label: "Home", to: "/" },
            { label: "About Us", to: "/about" },
            { label: "Create Post", to: "/create-post" },
            { label: "Profile", to: "/profile" },
            { label: "Chats", to: "/chats" },
            ].map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-[13px] text-white/50 hover:text-rust transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-rust transition-colors duration-200" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Social links */}
          <h4 className="font-display text-[15px] font-semibold text-white mb-4">
            Follow Us
          </h4>
          <div className="flex items-center gap-3">
            {[
              {
                label: "Instagram",
                href: "https://instagram.com",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                ),
              },
              {
                label: "Twitter / X",
                href: "https://twitter.com",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ),
              },
              {
                label: "Facebook",
                href: "https://facebook.com",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                ),
              },
              {
                label: "YouTube",
                href: "https://youtube.com",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
                  </svg>
                ),
              },
            ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white/50 hover:text-rust hover:border-rust hover:bg-white/10 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
        </div>

      </div>

      {/* ── Divider ── */}
      <div className="max-w-6xl mx-auto border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">

        <p className="text-[12px] text-white/30 text-center sm:text-left">
          © {new Date().getFullYear()} StrayOpt NGO. All rights reserved. Registered under the Societies Registration Act, India.
        </p>

        <div className="flex items-center gap-4">
          {["Privacy Policy", "Terms of Use", "Contact"].map(item => (
            <Link
              key={item}
              to="/"
              className="text-[12px] text-white/30 hover:text-rust transition-colors duration-200"
            >
              {item}
            </Link>
          ))}
        </div>

      </div>

    </footer>
  );
}