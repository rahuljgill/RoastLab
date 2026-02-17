import Navbar from "../components/Navbar";
import Hero from "../sections/Hero";
import Features from "../sections/Features";
import BuildPreview from "../sections/BuildPreview";
import BestSellers from "../sections/BestSellers";

export default function Home() {
  return (
    <div className="bg-dark-bg text-dark-text min-h-screen font-(--font-body)">
      <Navbar />

      <Hero />

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
