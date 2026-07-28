import ScrollHero from "./components/ScrollHero";
import FeaturesSection from "./components/FeaturesSection";
import SpecsSection from "./components/SpecsSection";
import ClosingCTA from "./components/ClosingCTA";

// Order is deliberate: the scroll hero owns the first ~3 screens, then the
// supporting sections fade in as the user continues. Add or reorder sections
// here — keep <main> pure black so nothing seams against the frames.
export default function Home() {
  return (
    <main style={{ background: "#000" }}>
      <ScrollHero />
      <FeaturesSection />
      <SpecsSection />
      <ClosingCTA />
    </main>
  );
}
