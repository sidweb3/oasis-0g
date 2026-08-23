/**
 * ZeroGSection — replaces PolygonSection on the Oasis landing page.
 * Shows 0G Chain primitives and how Oasis uses each one.
 */
import { motion } from "framer-motion";
import { Cpu, Database, Shield, Link2, Zap } from "lucide-react";

const primitives = [
  {
    icon: <Link2 className="h-5 w-5" />,
    name: "0G Chain",
    color: "from-cyan-500 to-blue-600",
    desc: "MasterVault, NativeVault, and RebalanceExecutor deployed on Aristotle (chainId 16661). All vault deposits and rebalance decisions are recorded on-chain.",
    status: "Active",
  },
  {
    icon: <Cpu className="h-5 w-5" />,
    name: "0G Compute",
    color: "from-violet-500 to-purple-600",
    desc: "AI inference via the 0G Compute Router (router-api.0g.ai/v1). TEE-verified responses with x-worker-signature attestation included in every on-chain executeRebalance call.",
    status: "Active",
  },
  {
    icon: <Database className="h-5 w-5" />,
    name: "0G Storage",
    color: "from-indigo-500 to-blue-500",
    desc: "Full decision records (inputs, AI output, reasoning, attestation) uploaded via @0gfoundation/0g-storage-ts-sdk with byte-level readback verification. Root hash stored on-chain.",
    status: "Active",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    name: "0G Agentic ID",
    color: "from-emerald-500 to-teal-600",
    desc: "The AI strategy is tokenized as an ERC-721 (StrategyAgenticID). Decision history is permanently tied to the token ID and survives ownership transfers — never reset.",
    status: "Active",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    name: "0G Pay",
    color: "from-amber-500 to-orange-500",
    desc: "Vault performance fees are taken in native 0G tokens. 0G Pay (pc.0g.ai) is a fiat/compute-credit service — no smart-contract-level vault fee integration exists yet.",
    status: "Partial (fee in 0G)",
  },
];

export function ZeroGSection() {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-black tracking-tight mb-3">
            Built on 0G Primitives
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Oasis uses five 0G infrastructure components end-to-end. No fake integrations — each
            primitive call is referenced in the code with exact file/line pointers in{" "}
            <code className="font-mono text-xs bg-muted px-1 rounded">docs/integration.md</code>.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {primitives.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4 hover:border-cyan-500/30 transition-colors"
            >
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-white`}>
                {p.icon}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm">{p.name}</h3>
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${
                    p.status === "Active"
                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                      : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                  }`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          ⚠ DemoYieldAdapter is a placeholder — no real yield is generated at this stage.
          APY figures shown in the dashboard are illustrative only. See docs/integration.md for full honesty notes.
        </motion.p>
      </div>
    </section>
  );
}
