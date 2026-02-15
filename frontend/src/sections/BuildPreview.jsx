import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BeanLayer from "../components/BeanLayer";

gsap.registerPlugin(ScrollTrigger);

export default function BuildPreview() {
  const sectionRef = useRef(null);
  const leftContentRef = useRef(null);
  const rightContentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(leftContentRef.current, {
        x: -60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(rightContentRef.current, {
        x: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center overflow-hidden"
    >
      {/* Falling Beans */}
      <BeanLayer />

      <div ref={leftContentRef} className="relative z-10">
        <h2 className="text-4xl font-semibold tracking-tight mb-6">
          Build Your Own Blend
        </h2>
        <p className="text-dark-muted leading-relaxed mb-6">
          Select your bean origin, roast profile, grind type, and bag size.
          Watch your price update in real time.
        </p>
        <button className="bg-brand text-black px-6 py-3 rounded-lg font-semibold hover:bg-brand-hover transition">
          Start Customising
        </button>
      </div>

      <div
        ref={rightContentRef}
        className="bg-dark-card p-8 rounded-2xl shadow-lg border border-dark-border relative z-10"
      >
        <div className="space-y-4 text-dark-muted">
          <p>
            <span className="text-brand font-medium">Origin:</span> Ethiopia
          </p>
          <p>
            <span className="text-brand font-medium">Roast:</span> Medium
          </p>
          <p>
            <span className="text-brand font-medium">Grind:</span> Espresso
          </p>
          <p>
            <span className="text-brand font-medium">Size:</span> 500g
          </p>
          <p className="text-xl font-semibold mt-6 text-dark-text">£18.50</p>
        </div>
      </div>
    </section>
  );
}
