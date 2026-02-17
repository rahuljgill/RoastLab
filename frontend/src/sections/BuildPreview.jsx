import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "01",
    title: "Pick a base",
    desc: "Choose a region and flavour profile as your starting point.",
    tags: ["Ethiopia", "Colombia", "Blend"],
  },
  {
    num: "02",
    title: "Tune the brew",
    desc: "Set roast + grind for your method; espresso, filter, moka, etc.",
    tags: ["Light", "Medium", "Espresso"],
  },
  {
    num: "03",
    title: "Lock the size",
    desc: "Select the bag size and watch pricing update instantly.",
    tags: ["250g", "500g", "1kg"],
  },
];

export default function BuildPreview() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const stepsRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(stepsRef.current?.children || [], {
        y: 18,
        opacity: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(panelRef.current, {
        x: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: panelRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-6 bg-dark-bg overflow-hidden border-t border-dark-border"
    >
      {/* top glow */}
      <div className="absolute inset-x-0 -top-24 h-64 pointer-events-none opacity-40">
        <div className="mx-auto w-2xl h-168 bg-brand/20 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div ref={headerRef} className="max-w-3xl">
          <p className="text-xs tracking-[0.25em] uppercase text-dark-muted">
            Build Your Blend
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
            Custom coffee,{" "}
            <span className="bg-linear-to-r from-brand to-brand-hover bg-clip-text text-transparent">
              in three moves.
            </span>
          </h2>

          <p className="text-dark-muted mt-6 leading-relaxed">
            A quick guided builder where you pick, tune, and lock it in. Pricing
            updates instantly so you always know what you’re paying.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/build-your-blend"
              className="bg-brand text-black px-6 py-3 rounded-lg font-semibold hover:bg-brand-hover transition"
            >
              Start Customising
            </Link>

            <Link
              to="/shop"
              className="border border-dark-border px-6 py-3 rounded-lg hover:border-brand transition"
            >
              Shop Beans
            </Link>
          </div>
        </div>

        {/* BODY */}
        <div className="mt-14 grid lg:grid-cols-12 gap-10 items-start">
          {/* LEFT: timeline steps  */}
          <div className="lg:col-span-5">
            <div ref={stepsRef} className="relative flex flex-col gap-5 pl-5">
              {/* vertical rail */}
              <div className="absolute left-2 top-2 bottom-2 w-px bg-dark-border" />

              {steps.map((step) => (
                <div
                  key={step.num}
                  className="relative bg-dark-card border border-dark-border rounded-2xl p-6"
                >
                  {/* dot */}
                  <span className="absolute -left-[0.6rem] top-7 w-3 h-3 rounded-full bg-brand shadow-[0_0_0_6px_rgba(0,0,0,0.25)]" />

                  <p className="text-xs tracking-[0.25em] uppercase text-dark-muted">
                    {step.num}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-dark-text">
                    {step.title}
                  </h3>
                  <p className="text-dark-muted mt-2 leading-relaxed">
                    {step.desc}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {step.tags.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1.5 text-xs rounded-full border border-dark-border bg-dark-bg/40 text-dark-text"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: preview panel, will probably change in future */}
          <div ref={panelRef} className="lg:col-span-7 relative">
            <div className="relative bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-dark-surface/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>

                <span className="text-xs tracking-[0.25em] uppercase text-dark-muted">
                  Live preview
                </span>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="grid gap-4">
                  <Row label="Origin" value="Ethiopia (Yirgacheffe)" />
                  <Row label="Roast" value="Medium" />
                  <Row label="Grind" value="Espresso" />
                  <Row label="Size" value="500g" />
                </div>

                <div className="mt-8 flex items-end justify-between">
                  <div>
                    <p className="text-xs tracking-[0.25em] uppercase text-dark-muted">
                      Estimated price
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-dark-text">
                      £18.50
                    </p>
                  </div>

                  <button className="bg-brand text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-hover transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* subtle side glow */}
            <div className="absolute -inset-10 opacity-30 pointer-events-none">
              <div className="w-120 h-120 bg-brand/20 blur-[130px] rounded-full ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-6 border border-dark-border rounded-xl px-5 py-4 bg-dark-bg/40">
      <span className="text-sm text-dark-muted">{label}</span>
      <span className="text-sm font-semibold text-dark-text">{value}</span>
    </div>
  );
}
