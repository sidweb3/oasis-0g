import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ArchitectureShowcaseSection } from "@/components/landing/ArchitectureShowcaseSection";
import { Features } from "@/components/blocks/features-8";
import { ZeroGSection } from "@/components/landing/ZeroGSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { CreamReversalSection } from "@/components/landing/CreamReversalSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { DockingCitrineCube } from "@/components/ui/DockingCitrineCube";
import NoiseDarkBlueGradientBackground from "@/components/ui/noise-dark-blue-gradient-with-squares";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-[#111111] relative overflow-x-hidden text-[#f9f9f9]">
      <NoiseDarkBlueGradientBackground />
      
      {/* Config-driven GSAP ScrollTrigger Docking 3D Citrine Cube */}
      <DockingCitrineCube />

      <Navbar />
      <main className="flex-1">
        {/* Section 1: Hero Beacon */}
        <HeroSection />
        
        {/* Section 2: 0G Primitive Matrix Assembly */}
        <ZeroGSection />
        
        <Features />
        
        {/* Section 3: The Constellation Enclave */}
        <HowItWorksSection />
        
        {/* Section 4: Strategy Tokenization Pipeline */}
        <ArchitectureShowcaseSection />
        
        {/* Section 5: Final Anchor Hub — Cube stops here & fans connectors down to live metrics */}
        <StatsSection />
        
        {/* Section 6: Institutional Reversal Band */}
        <CreamReversalSection />
        
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}