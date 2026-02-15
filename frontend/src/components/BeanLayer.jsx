import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Bean from "../assets/Bean.png";

gsap.registerPlugin(ScrollTrigger);

export default function BeanLayer() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;

      const count = 20;
      const size = 1.5;
      const fallDistance = 0.9;

      for (let i = 0; i < count; i++) {
        const bean = document.createElement("img");
        bean.src = Bean;
        bean.className = "absolute opacity-70";
        bean.style.width = `${size}rem`;
        bean.style.height = `${size}rem`;
        bean.style.left = `${Math.random() * 100}%`;
        bean.style.top = `${Math.random() * -300}px`;
        bean.style.willChange = "transform";

        container.appendChild(bean);

        gsap.to(bean, {
          y: window.innerHeight * fallDistance,
          rotation:
            gsap.utils.random(360, 1080) * (Math.random() > 0.5 ? 1 : -1),
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}
