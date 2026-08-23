import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Features } from "@/components/blocks/features-8";
import { WhyUsSection } from "@/components/landing/WhyUsSection";
import { ZeroGSection } from "@/components/landing/ZeroGSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ZeroGSection />
        <Features />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <WhyUsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}