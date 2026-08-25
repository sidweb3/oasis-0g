import { motion } from "framer-motion";
import { Cpu, Database, Shield, Link2, Zap, Layers, CheckCircle2 } from "lucide-react";

const primitives = [
  {
    icon: Link2,
    name: "0G Chain",
    desc: "NativeVault, RebalanceExecutor, and StrategyAgenticID deployed on Aristotle (16661). All deposits & AI rebalance execution recorded on-chain.",
    tag: "CHAIN ID 16661",
    hash: "0x8a...4f19",
  },
  {
    icon: Cpu,
    name: "0G Compute",
    desc: "AI inference executed inside 0G Compute TEE worker enclaves, generating cryptographic worker signatures verified by smart contracts.",
    tag: "TEE ATTESTED",
    hash: "0x3c...90b2",
  },
  {
    icon: Database,
    name: "0G Storage",
    desc: "Full decision records (prompts, reasoning, attestation hashes) stored immutably on 0G Storage with ChainScan audit verification.",
    tag: "IMMUTABLE AUDIT",
    hash: "0x7e...11c4",
  },
  {
    icon: Shield,
    name: "0G Agentic ID",
    desc: "The AI strategy is tokenized as an ERC-7857 NFT. Historical track record is permanently bound to the token ID across transfers.",
    tag: "ERC-7857 PRIMITIVE",
    hash: "0x12...88a0",
  },
  {
    icon: Layers,
    name: "0G Native Vault",
    desc: "ERC-4626 compliant capital vaults supporting 1-click 0G native token deposits and institutional yield optimization.",
    tag: "ERC-4626 VAULT",
    hash: "0x9f...44d1",
  },
];

interface ZeroGSectionProps {
  sectionRef?: React.RefObject<HTMLDivElement | null>;
  docked?: boolean;
}

export function ZeroGSection({ sectionRef, docked = false }: ZeroGSectionProps = {}) {
  return (
    <section ref={sectionRef} className="py-24 bg-[#111111] relative overflow-hidden border-t border-[#2b2b2b]">
      <div className="w-full max-w-[1280px] mx-auto px-8 md:px-12 lg:px-16 relative">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 space-y-4"
        >
          <span className="font-mono text-[10px] tracking-[0.032em] text-[#e5ff5d] uppercase font-bold bg-[#e5ff5d]/10 px-3 py-1 rounded-[4px] border border-[#e5ff5d]/30 inline-block">
            CHAPTER 2 · 0G PRIMITIVE MATRIX ASSEMBLY
          </span>
          <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.8px] leading-[0.95] uppercase text-[#f9f9f9]">
            BUILT NATIVELY ON 0G PRIMITIVES
          </h2>
          <p className="text-[#9c9c9c] text-sm max-w-xl mx-auto font-normal">
            The persistent Citrine Core docks directly into the 0G primitive engine, distributing verified data streams across all 5 infrastructure components.
          </p>
        </motion.div>

        {/* Central Puzzle Docking Socket */}
        <div className="relative my-12 flex justify-center items-center">
          <div
            id="matrix-socket-dock"
            className="w-36 h-36 rounded-full border border-[#2b2b2b] bg-[#1a1a1a]/60 flex items-center justify-center relative transition-all duration-300 shadow-[0_0_30px_rgba(229,255,93,0.15)]"
          >
            <span className="font-mono text-[9px] text-[#e5ff5d] uppercase tracking-[0.032em] font-bold opacity-60 text-center">
              0G MATRIX SOCKET
            </span>
          </div>
        </div>

        {/* Primitives Grid with Bespoke Energy Beam Connections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {primitives.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-[12px] border border-[#2b2b2b] bg-[#1a1a1a] p-6 flex flex-col justify-between hover:border-[#e5ff5d]/50 transition-colors group relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-[8px] bg-[#2b2b2b] border border-[#565656] flex items-center justify-center text-[#e5ff5d] group-hover:bg-[#e5ff5d] group-hover:text-[#111111] transition-colors">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.032em] text-[#e5ff5d] uppercase font-bold bg-[#e5ff5d]/10 px-2 py-0.5 rounded border border-[#e5ff5d]/30">
                    {p.tag}
                  </span>
                </div>
                <h3 className="font-medium text-lg text-[#f9f9f9]">{p.name}</h3>
                <p className="text-xs text-[#9c9c9c] leading-[1.50]">{p.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#2b2b2b] flex items-center justify-between font-mono text-[9px]">
                <div className="flex items-center gap-1.5 text-[#e5ff5d]">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="uppercase font-bold">ACTIVE</span>
                </div>
                <span className="text-[#9c9c9c]">{p.hash}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
