import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BeansVideo from "./assets/Beans.mp4";
import Navbar from "./components/Navbar";
import Features from "./sections/Features";
import BuildPreview from "./sections/BuildPreview";
import BestSellers from "./sections/BestSellers";

gsap.registerPlugin(ScrollTrigger);

function App() {
  // Refs for GSAP animations
  const heroHeadlineRef = useRef(null);
  const heroParagraphRef = useRef(null);
  const heroVideoRef = useRef(null);
  const heroSectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".navbar",
        { y: -80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: document.body,
            start: "top -50", // Activate once scrolled 50px from top
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    return () => ctx.revert();
  }, []);

  // Hero landing animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        heroVideoRef.current,
        { scale: 1.5 },
        { scale: 1, duration: 2, ease: "power2.out" },
      )
        .from(
          heroHeadlineRef.current,
          {
            y: 50,
            opacity: 0,
            duration: 1,
          },
          "-=1.5",
        )
        .from(
          heroParagraphRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.8",
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-dark-bg text-dark-text min-h-screen font-(--font-body)">
      <Navbar />

      {/* HERO */}
      <section
        ref={heroSectionRef}
        className="relative h-screen flex items-center justify-center text-center overflow-hidden"
      >
        <div ref={heroVideoRef} className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={BeansVideo} type="video/mp4" />
          </video>
        </div>

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-b from-transparent to-dark-bg"></div>

        <div className="relative z-10 max-w-4xl px-6">
          <h2
            ref={heroHeadlineRef}
            className="text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight mb-6"
          >
            Engineer Your{" "}
            <span className="bg-linear-to-r from-brand to-brand-hover bg-clip-text text-transparent">
              Perfect Brew
            </span>
          </h2>

          <p
            ref={heroParagraphRef}
            className="text-gray-200 text-lg leading-relaxed max-w-2xl mx-auto mt-8"
          >
            Premium small-batch coffee. Fully customizable. Freshly roasted and
            delivered to your door.
          </p>
        </div>
      </section>

      <Features />
      <BuildPreview />
      <BestSellers />

      <footer className="py-12 text-center border-t border-dark-border">
        <p className="text-dark-muted text-sm">
          © 2026 RoastLab. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
