import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight, Terminal } from "lucide-react";

interface CreamReversalSectionProps {
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}

export function CreamReversalSection({ sectionRef }: CreamReversalSectionProps = {}) {
  return (
    <section ref={sectionRef} className="w-full bg-[#eeeeee] py-24 px-8 md:px-12 lg:px-16 text-[#111111] relative overflow-hidden my-16">
      {/* Decorative Citrine Cube Cluster Background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-25 pointer-events-none mix-blend-multiply">
        <img src="/citrine_cube_cluster.jpg" alt="Citrine Cubes Cluster" className="w-full h-full object-contain" />
      </div>

      <div className="w-full max-w-[1280px] mx-auto relative z-10 space-y-8">
        
        {/* Utility Label */}
        <span className="font-mono text-[11px] tracking-[0.032em] uppercase font-bold text-[#111111] bg-[#111111]/10 px-3 py-1 rounded-[4px] inline-block border border-[#111111]/20">
          REASONING ON-CHAIN · ZERO BLACK BOXES
        </span>

        {/* Monolithic 80px Display Headline */}
        <h2 className="text-5xl md:text-7xl lg:text-[80px] font-normal tracking-[-0.8px] leading-[0.90] uppercase text-[#111111] max-w-4xl">
          VERIFIABLE INFRASTRUCTURE FOR DECENTRALIZED CAPITAL
        </h2>

        {/* Subhead Paragraph */}
        <p className="text-[#565656] text-lg max-w-2xl leading-[1.5] font-normal">
          Oasis anchors portfolio decisions directly to 0G Compute TEE worker enclaves and 0G Storage reasoning logs. Every rebalance emits an immutable cryptographic proof on 0G Chain.
        </p>

        {/* CTA Action Row */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Link to="/vaults">
            <button className="bg-[#111111] text-[#f9f9f9] hover:bg-[#2b2b2b] px-6 py-3 rounded-[4px] font-medium text-sm flex items-center gap-2 tracking-wide transition-colors">
              <Terminal className="h-4 w-4 text-[#e5ff5d]" />
              LAUNCH VAULT TERMINAL
              <ArrowRight className="h-4 w-4 text-[#e5ff5d]" />
            </button>
          </Link>

          <Link to="/whitepaper">
            <button className="border border-[#111111] text-[#111111] hover:bg-[#111111]/10 px-5 py-3 rounded-[4px] font-medium text-xs tracking-[0.032em] uppercase transition-colors">
              READ ARCHITECTURE SPEC
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
