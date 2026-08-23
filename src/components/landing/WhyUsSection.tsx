import { motion } from "framer-motion";
import { Shield, Cpu, TrendingUp, Lock } from "lucide-react";

const reasons = [
  {
    icon: Shield,
    title: "Production-Ready Vaults",
    description: "Deployed smart contracts on 0G Chain Aristotle with ERC-4626 standard and ReentrancyGuard security.",
    accent: "text-cyan-400",
    tag: "SECURITY",
  },
  {
    icon: Cpu,
    title: "Verifiable AI Model",
    description: "Inference runs on 0G Compute with TEE worker attestations — not a static rule or off-chain mock.",
    accent: "text-purple-400",
    tag: "AI COMPUTE",
  },
  {
    icon: TrendingUp,
    title: "Dual Asset Support",
    description: "Deposit native 0G (1 tx) or USDC (ERC-20 standard). Both vaults optimized by the AI executor.",
    accent: "text-indigo-400",
    tag: "FLEXIBILITY",
  },
  {
    icon: Lock,
    title: "Immutable Storage Logs",
    description: "Full decision records (inputs, reasoning, root hash) stored on 0G Storage with ChainScan verification.",
    accent: "text-amber-400",
    tag: "TRUST",
  },
];

export function WhyUsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
              Why Choose Oasis
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid md:grid-cols-2 gap-4 items-end">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              WHY CHOOSE
              <br />
              <span className="text-cyan-400">OASIS ON 0G?</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every component is built natively on 0G primitives. Complete end-to-end transparency with real AI inference and immutable storage.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-border bg-card rounded-lg p-6 hover:border-cyan-400/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <reason.icon className={`h-6 w-6 ${reason.accent}`} />
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  {reason.tag}
                </span>
              </div>
              <h3 className="font-bold text-base mb-2">{reason.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}