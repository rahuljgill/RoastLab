import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiCoffee, FiTruck, FiAward } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    num: "01",
    icon: <FiCoffee className="text-3xl text-brand" />,
    title: "Precision Blends",
    desc: "Choose origin, roast profile, grind type, and size to build a coffee that matches your taste, not a generic default.",
  },
  {
    num: "02",
    icon: <FiTruck className="text-3xl text-brand" />,
    title: "Roasted & Shipped Fast",
    desc: "Small-batch roasting for peak flavour, then packed and dispatched quickly so your bag arrives fresh, not stale.",
  },
  {
    num: "03",
    icon: <FiAward className="text-3xl text-brand" />,
    title: "Sourced With Standards",
    desc: "Beans from standout regions worldwide, selected for consistency, transparency, and flavour quality in every roast level.",
  },
];

export default function Features() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-6 bg-dark-surface overflow-hidden"
    >
      <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-16 items-start">
        {/* LEFT  BLOCK */}
        <div className="md:sticky md:top-28">
          <p className="text-xs tracking-[0.25em] uppercase text-dark-muted">
            Why RoastLab
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
            RoastLab isn't a shop.{" "}
            <span className="bg-linear-to-r from-brand to-brand-hover bg-clip-text text-transparent">
              It's a coffee lab.
            </span>
          </h2>

          <p className="text-dark-muted mt-6 leading-relaxed max-w-xl">
            We treat coffee like a craft and a system. Sourced responsibly,
            roasted in small batches, and built around taste you can control. No
            generic defaults. No guessing. Just great coffee, engineered for
            your routine.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <span className="px-3 py-1.5 text-sm rounded-full border border-dark-border bg-dark-card text-dark-text">
              Small-batch roasting
            </span>
            <span className="px-3 py-1.5 text-sm rounded-full border border-dark-border bg-dark-card text-dark-text">
              Transparent sourcing
            </span>
            <span className="px-3 py-1.5 text-sm rounded-full border border-dark-border bg-dark-card text-dark-text">
              Custom blends
            </span>
          </div>
        </div>

        {/* RIGHT STACKED CARDS */}
        <div className="flex flex-col gap-6">
          {cards.map(({ num, icon, title, desc }) => (
            <div
              key={num}
              className="group bg-dark-card border border-dark-border rounded-2xl p-7 hover:border-brand transition"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs tracking-[0.25em] uppercase text-dark-muted">
                    {num}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{title}</h3>
                  <p className="text-dark-muted mt-3 leading-relaxed">{desc}</p>
                </div>
                <div className="shrink-0 p-4 rounded-2xl bg-dark-bg border border-dark-border group-hover:border-brand transition">
                  {icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
