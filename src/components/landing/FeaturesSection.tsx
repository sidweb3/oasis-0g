import { motion } from "framer-motion";
import { RefreshCw, Layers, BrainCircuit, ShieldCheck, Database, Cpu } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    tag: "0G COMPUTE",
    title: "Verifiable AI Rebalancing",
    description: "Rebalancing decisions are made by an AI model on 0G Compute (router-api.0g.ai/v1) — not a static rule or mock. Every execution carries a TEE worker attestation.",
    accent: "text-cyan-400",
    border: "border-cyan-400/20",
    bg: "bg-cyan-400/5",
  },
  {
    icon: Database,
    tag: "0G STORAGE",
    title: "On-Chain Reasoning Feed",
    description: "Decision records (inputs, reasoning, attestation, root hash) are uploaded to 0G Storage via @0gfoundation/0g-storage-ts-sdk with byte-level readback verification.",
    accent: "text-indigo-400",
    border: "border-indigo-400/20",
    bg: "bg-indigo-400/5",
  },
  {
    icon: Cpu,
    tag: "0G AGENTIC ID",
    title: "Tokenized Strategy Identity",
    description: "The AI strategy is tokenized as an ERC-721 StrategyAgenticID. Transferring the token carries its complete decision history forward without reset.",
    accent: "text-purple-400",
    border: "border-purple-400/20",
    bg: "bg-purple-400/5",
  },
  {
    icon: Layers,
    tag: "ARCHITECTURE",
    title: "Native Vault Architecture",
    description: "NativeVault (native 0G) connected to DemoYieldAdapter via RebalanceExecutor for verifiable AI-optimized allocation.",
    accent: "text-blue-400",
    border: "border-blue-400/20",
    bg: "bg-blue-400/5",
  },
  {
    icon: RefreshCw,
    tag: "SAFETY",
    title: "Timeout Fail-Safe",
    description: "If a 0G Compute rebalance request is not executed within the timeout window, refundOrHoldOnFailure() keeps funds safely in the vault without blocking.",
    accent: "text-amber-400",
    border: "border-amber-400/20",
    bg: "bg-amber-400/5",
  },
  {
    icon: ShieldCheck,
    tag: "HONESTY",
    title: "Transparent Adapter Status",
    description: "DemoYieldAdapter is clearly labeled as a demo placeholder with no real yield. APY figures are illustrative only until real protocols deploy on 0G Chain.",
    accent: "text-emerald-400",
    border: "border-emerald-400/20",
    bg: "bg-emerald-400/5",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-full inline-block">
            Core Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Engineered for Verifiable AI Yield
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Oasis combines 0G Chain smart contracts with 0G Compute AI inference and 0G Storage immutable logs.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`border ${feature.border} ${feature.bg} rounded-xl p-6 relative group hover:border-cyan-400/40 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg border ${feature.border} ${feature.bg}`}>
                  <feature.icon className={`h-5 w-5 ${feature.accent}`} />
                </div>
                <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${feature.border} ${feature.accent}`}>
                  {feature.tag}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}