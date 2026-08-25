import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, Shield, Cpu, Database } from "lucide-react";
import { Link } from "react-router";

interface ArchitectureShowcaseSectionProps {
  sectionRef?: React.RefObject<HTMLDivElement | null>;
  docked?: boolean;
}

export function ArchitectureShowcaseSection({ sectionRef, docked = false }: ArchitectureShowcaseSectionProps = {}) {
  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden bg-[#111111] border-t border-[#2b2b2b]">
      <div className="w-full max-w-[1280px] mx-auto px-8 md:px-12 lg:px-16 space-y-24">
        
        {/* Showcase Feature 1: Verifiable TEE Execution Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Graphic Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 relative group"
          >
            <div className="relative rounded-[12px] overflow-hidden border border-[#2b2b2b] bg-[#1a1a1a] shadow-2xl">
              <img
                src="/oasis_architecture_flow.jpg"
                alt="0G Architecture Execution Flow"
                className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent flex items-end p-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] tracking-[0.032em] text-[#e5ff5d] uppercase font-bold bg-[#e5ff5d]/10 px-2.5 py-1 rounded border border-[#e5ff5d]/30">
                    0G COMPUTE TEE ENCLAVE
                  </span>
                  <span className="text-xs font-mono text-[#9c9c9c]">
                    Hardware Attested Execution Pipeline
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Technical Explanation */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <span className="font-mono text-[10px] tracking-[0.032em] text-[#e5ff5d] uppercase font-bold bg-[#e5ff5d]/10 px-3 py-1 rounded-[4px] border border-[#e5ff5d]/30 inline-block">
              VERIFIABLE EXECUTION PIPELINE
            </span>

            <h2 className="text-2xl md:text-4xl font-normal tracking-[-0.8px] leading-[0.95] uppercase text-[#f9f9f9]">
              Cryptographic AI Inference directly on 0G Compute
            </h2>

            <p className="text-[#9c9c9c] text-sm leading-[1.50] font-normal">
              Oasis replaces off-chain black-box AI model claims with verifiable execution. Rebalancing decisions run strictly inside 0G Compute TEE worker enclaves, emitting cryptographic signatures (<code className="font-mono text-[#e5ff5d]">x-worker-signature</code>) verified directly by smart contracts on-chain.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { label: "0G Compute TEE Enclave", desc: "Hardware attestation guarantees model model weights & output integrity." },
                { label: "0G Storage Decision Tree", desc: "Full input prompts, reasoning logs, and Merkle root hashes archived immutably." },
                { label: "On-Chain Rebalance Executor", desc: "Verifies signatures before shifting vault capital to target adapters." },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-[8px] bg-[#1a1a1a] border border-[#2b2b2b]">
                  <CheckCircle2 className="h-4 w-4 text-[#e5ff5d] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#f9f9f9] font-mono">{item.label}</p>
                    <p className="text-xs text-[#9c9c9c]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Showcase Feature 2: Strategy Agentic ID Standard (ERC-7857) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-12 border-t border-[#2b2b2b]">
          
          {/* Left: Text & Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6 order-2 lg:order-1"
          >
            <span className="font-mono text-[10px] tracking-[0.032em] text-[#e5ff5d] uppercase font-bold bg-[#e5ff5d]/10 px-3 py-1 rounded-[4px] border border-[#e5ff5d]/30 inline-block">
              CHAPTER 4 · ERC-7857 AGENTIC REPUTATION
            </span>

            <h2 className="text-2xl md:text-4xl font-normal tracking-[-0.8px] leading-[0.95] uppercase text-[#f9f9f9]">
              Tokenized AI Strategy Reputation & Ownership
            </h2>

            <p className="text-[#9c9c9c] text-sm leading-[1.50] font-normal">
              Every AI yield strategy is tokenized as a <code className="font-mono text-[#e5ff5d]">StrategyAgenticID</code> (ERC-721). The AI model's historical track record, execution efficiency, and verified decisions travel permanently with the token ID—even across ownership transfers.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { label: "Immutable Track Record", desc: "History is bound to Token ID on 0G Chain and is never wiped upon transfer." },
                { label: "Verifiable Trust Primitive", desc: "Buyers verify full historical risk & return before acquiring AI strategy tokens." },
                { label: "Institutional Composability", desc: "Enables strategy marketplaces, performance fees, and DAO governance." },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-[8px] bg-[#1a1a1a] border border-[#2b2b2b]">
                  <Sparkles className="h-4 w-4 text-[#e5ff5d] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#f9f9f9] font-mono">{item.label}</p>
                    <p className="text-xs text-[#9c9c9c]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link to="/agentic-id">
                <button className="border border-[#e5ff5d] text-[#e5ff5d] hover:bg-[#e5ff5d]/10 px-5 py-2.5 rounded-[4px] font-mono text-xs tracking-[0.032em] uppercase transition-colors flex items-center gap-2">
                  INSPECT STRATEGY TOKEN #0 <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Graphic Illustration & Docking Slot */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 relative group order-1 lg:order-2"
          >
            <div className="relative rounded-[12px] overflow-hidden border border-[#2b2b2b] bg-[#1a1a1a] shadow-2xl p-4">
              
              {/* Puzzle Slot Marker inside Card */}
              <div
                id="pipeline-dock-target"
                className="w-full h-32 rounded-full border border-[#2b2b2b] bg-[#111111]/60 flex items-center justify-center relative mb-4 transition-all duration-300"
              >
                <span className="font-mono text-[9px] text-[#e5ff5d] uppercase tracking-[0.032em] font-bold opacity-60">
                  PIPELINE ENGINE DOCK
                </span>
              </div>

              <img
                src="/oasis_agentic_reputation.jpg"
                alt="Strategy Agentic ID NFT Primitive"
                className="w-full h-auto object-cover rounded-[8px] opacity-90"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#e5ff5d] uppercase font-bold">
                  0G AGENTIC ID REPUTATION NFT
                </span>
                <span className="text-[10px] font-mono text-[#9c9c9c]">
                  Token #0 · Deployed on Aristotle Mainnet
                </span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
