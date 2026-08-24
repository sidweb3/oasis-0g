import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ArchitectureShowcaseSection } from "@/components/landing/ArchitectureShowcaseSection";
import { Features } from "@/components/blocks/features-8";
import { ZeroGSection } from "@/components/landing/ZeroGSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import NoiseDarkBlueGradientBackground from "@/components/ui/noise-dark-blue-gradient-with-squares";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent relative">
      <NoiseDarkBlueGradientBackground />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ZeroGSection />
        <Features />
        <ArchitectureShowcaseSection />
        <HowItWorksSection />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}