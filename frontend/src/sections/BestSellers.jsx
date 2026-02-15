import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DarkBeans from "../assets/dark.jpg";
import MediumBeans from "../assets/medium.jpg";
import LightBeans from "../assets/light.jpg";
import BeanLayer from "../components/BeanLayer";

gsap.registerPlugin(ScrollTrigger);

export default function BestSellers() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(gridRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
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
      className="relative py-20 px-6 bg-dark-surface overflow-hidden"
    >
      {/* Falling Beans */}
      <BeanLayer />

      <div className="max-w-6xl mx-auto relative z-10">
        <h2
          ref={titleRef}
          className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-12"
        >
          Best Sellers
        </h2>

        <div ref={gridRef} className="grid md:grid-cols-3 gap-8">
          {[
            {
              img: DarkBeans,
              title: "Midnight Blend",
              desc: "Bold, intense dark roast with deep chocolate notes.",
            },
            {
              img: MediumBeans,
              title: "Colombia Dark Roast",
              desc: "Smooth and balanced with caramel sweetness.",
            },
            {
              img: LightBeans,
              title: "Ethiopia Light Roast",
              desc: "Bright and floral with subtle citrus notes.",
            },
          ].map(({ img, title, desc }) => (
            <div
              key={title}
              className="bg-dark-card rounded-xl border border-dark-border overflow-hidden hover:border-brand transition group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={img}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-dark-muted mb-4 leading-relaxed">{desc}</p>
                <button className="text-brand hover:underline font-medium">
                  View Product
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
