import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Connect Wallet",
    desc: "Connect MetaMask or any Web3 wallet. Switch to 0G Chain Aristotle Mainnet (Chain ID 16661).",
    detail: "wagmi + viem",
  },
  {
    num: "02",
    title: "Choose Native Vault",
    desc: "Deposit 0G tokens directly into NativeVault with instant 1-transaction confirmation.",
    detail: "Native 0G Vault",
  },
  {
    num: "03",
    title: "AI Inference & Proofs",
    desc: "0G Compute model executes inference inside TEE enclave, generating cryptographic worker signatures.",
    detail: "0G Compute TEE",
  },
  {
    num: "04",
    title: "On-Chain Rebalance",
    desc: "RebalanceExecutor verifies TEE proofs and commits full decision rationale to 0G Storage.",
    detail: "0G Storage Audit",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="w-full px-8 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono-data text-xs text-muted-foreground tracking-widest uppercase">
              03 / Process
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            HOW IT
            <br />
            <span className="text-primary">WORKS</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-border z-0" />

          <div className="grid lg:grid-cols-4 gap-px bg-border">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-background p-8 group hover:bg-card transition-colors relative"
              >
                {/* Step number */}
                <div className="font-mono-data text-6xl font-black text-primary/10 group-hover:text-primary/20 transition-colors leading-none mb-6 select-none">
                  {step.num}
                </div>

                <h3 className="text-lg font-bold mb-3 tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.desc}</p>

                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/5 border border-primary/20 rounded-sm">
                  <span className="w-1 h-1 bg-primary rounded-full" />
                  <span className="font-mono-data text-[10px] text-primary uppercase tracking-wider">{step.detail}</span>
                </div>

                {/* Arrow connector */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-12 -right-3 z-10 text-border text-lg font-mono">›</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}