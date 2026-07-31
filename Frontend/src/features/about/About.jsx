import { Link } from "react-router-dom";
import { useInView } from "./components/useInView";
import AnimatedCounter from "./components/AnimatedCounter";

const missionCards = [
  { title: "Rescue", text: "Help stray animals get noticed by caring people." },
  { title: "Adoption", text: "Make it easier to connect rescuers, adopters, and animal lovers." },
  { title: "Community", text: "Build a network where everyone can contribute to saving lives." },
];

const steps = [
  { number: "1", title: "Create a Post", text: "Upload up to 5 photos with the pet's location and description." },
  { number: "2", title: "Discover Pets", text: "Browse animals posted by the community." },
  { number: "3", title: "Connect", text: "Start a conversation with the person who shared the pet." },
  { number: "4", title: "Adopt or Rescue", text: "Help the pet find a loving home." },
];

const features = [
  { title: "Multiple Photo Uploads" },
  { title: "Real-Time Chat" },
  { title: "Location-Based Posts" },
  { title: "Community Driven" },
  { title: "Secure Authentication" },
  { title: "Fast & Responsive" },
];

const impact = [
  { value: 120, suffix: "+", label: "Pets Shared" },
  { value: 45, suffix: "+", label: "Successful Adoptions" },
  { value: 500, suffix: "+", label: "Community Members" },
  { value: 15, suffix: "+", label: "Cities Connected" },
];

function FadeSection({ children, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Small dot icon used in place of feature emojis
function FeatureIcon() {
  return (
    <span className="w-9 h-9 rounded-full bg-rust/10 flex items-center justify-center flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0572A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      {/* Hero */}
      <section className="relative px-6 py-28 text-center overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold text-bark-dark leading-tight mb-6">
            Every Stray Deserves a Loving Home.
          </h1>
          <p className="text-text-mid text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            StrayAdopt connects compassionate people with stray animals in need. Share, discover, and help give abandoned pets a second chance at life.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/pets"
              className="bg-rust hover:bg-rust-hover text-white font-medium px-8 py-4 rounded-full transition-colors"
            >
              Explore Pets
            </Link>
            <Link
              to="/create-post"
              className="border-2 border-bark text-bark-dark font-medium px-8 py-4 rounded-full hover:bg-warm transition-colors"
            >
              Create a Post
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 py-20 bg-warm">
        <FadeSection className="text-center mb-14">
          <h2 className="font-display text-3xl font-semibold text-bark-dark mb-2">Our Mission</h2>
        </FadeSection>

        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8">
          {missionCards.map((card, i) => (
            <FadeSection key={card.title}>
              <div
                className="bg-white rounded-2xl p-8 text-center border border-border-brand transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <h3 className="font-display text-xl font-semibold text-bark-dark mb-2">{card.title}</h3>
                <p className="text-text-mid text-[15px] leading-relaxed">{card.text}</p>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="px-6 py-24 max-w-3xl mx-auto text-center">
        <FadeSection>
          <h2 className="font-display text-3xl font-semibold text-bark-dark mb-6">Our Story</h2>
          <p className="text-text-mid text-lg leading-relaxed">
            StrayAdopt was created with one simple belief—every stray animal deserves love, care, and a safe home. Many people want to help but don't know where to start. Our platform bridges that gap by allowing users to share stray pet sightings, connect with rescuers through real-time chat, and support local adoption efforts.
          </p>
        </FadeSection>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-warm">
        <FadeSection className="text-center mb-16">
          <h2 className="font-display text-3xl font-semibold text-bark-dark mb-2">How It Works</h2>
        </FadeSection>

        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, i) => (
            <FadeSection key={step.number}>
              <div className="relative text-center" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="w-14 h-14 rounded-full bg-rust text-white font-display text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-display text-lg font-semibold text-bark-dark mb-2">{step.title}</h3>
                <p className="text-text-mid text-[14px] leading-relaxed">{step.text}</p>

                {i < steps.length - 1 && (
                  <span className="hidden lg:block absolute top-7 left-[calc(50%+3rem)] w-[calc(100%-6rem)] text-rust/30 text-xl">
                    →
                  </span>
                )}
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-6 py-20">
        <FadeSection className="text-center mb-14">
          <h2 className="font-display text-3xl font-semibold text-bark-dark mb-2">Why Choose StrayAdopt?</h2>
        </FadeSection>

        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FadeSection key={f.title}>
              <div
                className="bg-white border border-border-brand rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-rust/40"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <FeatureIcon />
                <span className="font-medium text-bark-dark">{f.title}</span>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section className="px-6 py-20 bg-bark-dark">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {impact.map((stat) => (
            <div key={stat.label}>
              <div className="[&_span]:text-cream">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-cream/60 text-sm uppercase tracking-wide mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Join Community CTA */}
      <section className="px-6 py-24 text-center bg-rust">
        <FadeSection className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-semibold text-white mb-4">
            Every post can change a life.
          </h2>
          <p className="text-white/85 text-lg leading-relaxed mb-8">
            Whether you're rescuing, fostering, adopting, or simply sharing a stray's story, you're making a difference.
          </p>
          <Link
            to="/create-post"
            className="inline-block bg-white text-rust font-medium px-8 py-4 rounded-full hover:bg-cream transition-colors"
          >
            Start Helping Today
          </Link>
        </FadeSection>
      </section>

      {/* Footer quote */}
      <section className="px-6 py-16 text-center">
        <p className="font-display italic text-text-mid text-lg max-w-xl mx-auto">
          "Saving one animal won't change the world, but it will change the world for that one animal."
        </p>
      </section>
    </div>
  );
}