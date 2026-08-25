import { motion } from "framer-motion";
import { ConstellationNetwork } from "@/components/ui/ConstellationNetwork";
import { Terminal, ShieldCheck, Cpu } from "lucide-react";

interface HowItWorksSectionProps {
  sectionRef?: React.RefObject<HTMLDivElement | null>;
  active?: boolean;
}

export function HowItWorksSection({ sectionRef, active = true }: HowItWorksSectionProps) {
  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden bg-[#111111] border-t border-[#2b2b2b]">
      <div className="w-full max-w-[1280px] mx-auto px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text Stack */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <span className="font-mono text-[10px] tracking-[0.032em] text-[#e5ff5d] uppercase font-bold bg-[#e5ff5d]/10 px-3 py-1 rounded-[4px] border border-[#e5ff5d]/30 inline-block">
              NETWORK TOPOLOGY & HARDWARE PROOFS
            </span>

            <h2 className="text-3xl md:text-4xl font-normal text-[#f9f9f9] leading-[1.10] uppercase tracking-[-0.8px]">
              RAW BLOCKCHAIN YIELD DATA IS COMPLEX TO PARSE
            </h2>

            <p className="text-[#9c9c9c] text-sm leading-[1.50] font-normal">
              Oasis unifies 0G Chain Aristotle Mainnet smart contracts, 0G Compute TEE worker enclaves, 0G Storage immutable Merkle trees, and Strategy Agentic IDs into a single verifiable execution engine.
            </p>

            <p className="text-[#9c9c9c] text-sm leading-[1.50] font-normal">
              Instead of trusting off-chain yield claims, every capital rebalance emits an immutable hardware attestation on-chain that can be audited by anyone in real-time.
            </p>

            {/* Live TEE Verification Terminal Box */}
            <div className="rounded-[10px] border border-[#2b2b2b] bg-[#161616] p-4 font-mono text-[11px] space-y-2">
              <div className="flex items-center justify-between border-b border-[#2b2b2b] pb-2 text-[#9c9c9c]">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-[#e5ff5d]" />
                  <span className="text-[10px] uppercase tracking-widest">TEE ATTESTATION LOG</span>
                </div>
                <span className="text-[9px] text-[#e5ff5d] bg-[#e5ff5d]/10 px-2 py-0.5 rounded border border-[#e5ff5d]/30">LIVE 16661</span>
              </div>
              <div className="space-y-1.5 pt-1 text-[#f9f9f9]">
                <p className="flex items-center justify-between">
                  <span className="text-[#9c9c9c]">Worker Signature:</span>
                  <span className="text-[#e5ff5d]">0x8a7f...90b2</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-[#9c9c9c]">0G Storage Root:</span>
                  <span className="text-[#f9f9f9]">0x3c11...88a0</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-[#9c9c9c]">Rebalance Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 inline" /> VERIFIED
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2b2b2b] grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-xs text-[#e5ff5d] font-bold">100% TEE ATTESTED</p>
                <p className="text-xs text-[#9c9c9c] mt-0.5">Signed Enclave Output</p>
              </div>
              <div>
                <p className="font-mono text-xs text-[#e5ff5d] font-bold">ERC-7857 STANDARD</p>
                <p className="text-xs text-[#9c9c9c] mt-0.5">Tokenized Track Record</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Constellation Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex justify-center items-center"
          >
            <ConstellationNetwork active={active} />
          </motion.div>

        </div>
      </div>
    </section>
  );
}