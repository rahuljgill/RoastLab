import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiCoffee, FiTruck, FiAward } from "react-icons/fi";
import BeanLayer from "../components/BeanLayer";

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const sectionRef = useRef(null);
  const featureCardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(featureCardsRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 20%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-6 bg-dark-surface overflow-hidden"
    >
      {/* Falling Beans */}
      <BeanLayer />

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-16 text-center relative z-10">
        {/* Custom Blends */}
        <div
          ref={(element) => (featureCardsRef.current[0] = element)}
          className="group"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border group-hover:border-brand transition">
              <FiCoffee className="text-3xl text-brand" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-4">Build Your Blend</h3>
          <p className="text-dark-muted leading-relaxed">
            Choose origin, roast level, grind type and size. Fully customizable
            coffee.
          </p>
        </div>

        {/* Fresh & Fast */}
        <div
          ref={(element) => (featureCardsRef.current[1] = element)}
          className="group"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border group-hover:border-brand transition">
              <FiTruck className="text-3xl text-brand" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-4">Fast Fresh Delivery</h3>
          <p className="text-dark-muted leading-relaxed">
            Small-batch roasted and shipped quickly for peak freshness.
          </p>
        </div>

        {/* Premium Quality */}
        <div
          ref={(element) => (featureCardsRef.current[2] = element)}
          className="group"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border group-hover:border-brand transition">
              <FiAward className="text-3xl text-brand" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-4">Premium Quality</h3>
          <p className="text-dark-muted leading-relaxed">
            Ethically sourced beans from the world's best coffee regions.
          </p>
        </div>
      </div>
    </section>
  );
}
