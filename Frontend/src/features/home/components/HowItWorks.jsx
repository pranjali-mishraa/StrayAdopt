const steps = [
    {
      number: "1",
      image: "/Step1.png",
      ringColor: "bg-rust",
      title: "Spot & Upload",
      description:
        "Found a stray nearby? Take a photo, add the location and a short description, and post it on StrayOpt in under a minute.",
    },
    {
      number: "2",
      image: "/Step2.png",
      ringColor: "bg-bark",
      title: "Connect & Ask",
      description:
        "See an animal you'd like to adopt? Message the person who posted it directly through StrayOpt and arrange a time to meet.",
    },
    {
      number: "3",
      image: "/Step3.png",
      ringColor: "bg-rust",
      title: "Visit & Adopt",
      description:
        "Visit the locality, meet the animal, and if it feels right — take them home. Give a stray the forever family they deserve.",
    },
  ];
  
  export default function HowItWorks() {
    return (
      <section className="bg-cream  py-24 px-6">
        {/* Section header */}
        <div className="text-center mb-20 animate-slide-down">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-rust" />
            <p className="text-rust text-[13px] font-medium uppercase tracking-widest">
              How It Works
            </p>
            <span className="w-8 h-[2px] bg-rust" />
          </div>
          <h2 className="font-display text-[clamp(2.2rem,4vw,3.2rem)] font-semibold text-bark-dark">
            Pet Adoption Process
          </h2>
        </div>
  
        {/* Steps grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group flex flex-col items-center text-center"
            >
              {/* Ring + image */}
              <div className="relative w-[220px] h-[220px] mb-8 transition-transform duration-500 ease-out group-hover:scale-105">
                <div
                  className={`absolute inset-0 rounded-full ${step.ringColor} transition-transform duration-500 ease-out group-hover:rotate-6`}
                />
                <div className="absolute inset-[10px] rounded-full bg-warm overflow-hidden">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                </div>
                {/* Step number badge */}
                <div className="absolute top-0 right-0 w-11 h-11 bg-warm border-4 border-warm rounded-full flex items-center justify-center shadow-sm transition-transform duration-300 ease-out group-hover:scale-110">
                  <span className="font-display text-lg font-bold text-rust">
                    {step.number}
                  </span>
                </div>
              </div>
  
              <h3 className="font-display text-2xl font-semibold text-bark-dark mb-3 transition-colors duration-300 group-hover:text-rust">
                {step.title}
              </h3>
              <p className="text-text-mid text-[15px] leading-relaxed max-w-[260px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }