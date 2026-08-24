import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Cpu, Database, ShieldCheck, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { Link } from "react-router";

export function ArchitectureShowcaseSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-transparent border-t border-border/40">
      <div className="w-full px-8 md:px-12 lg:px-16 space-y-24">
        
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
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:opacity-100 transition-opacity opacity-70" />
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-card/80 shadow-2xl">
              <img
                src="/oasis_architecture_flow.jpg"
                alt="0G Architecture Execution Flow"
                className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent flex items-end p-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-cyan-400/40 bg-cyan-500/10 text-cyan-400 font-mono text-xs">
                    0G COMPUTE TEE ENCLAVE
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
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
            <Badge variant="outline" className="px-3 py-1 border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-mono text-xs">
              VERIFIABLE EXECUTION PIPELINE
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Cryptographic AI Inference directly on 0G Compute
            </h2>

            <p className="text-muted-foreground text-sm leading-relaxed">
              Oasis replaces off-chain black-box AI model claims with verifiable execution. Rebalancing decisions run strictly inside 0G Compute TEE worker enclaves, emitting cryptographic signatures (<code className="font-mono text-cyan-300">x-worker-signature</code>) verified directly by smart contracts on-chain.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { label: "0G Compute TEE Enclave", desc: "Hardware attestation guarantees model model weights & output integrity." },
                { label: "0G Storage Decision Tree", desc: "Full input prompts, reasoning logs, and Merkle root hashes archived immutably." },
                { label: "On-Chain Rebalance Executor", desc: "Verifies signatures before shifting vault capital to target adapters." },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/50">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground font-mono">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Showcase Feature 2: Strategy Agentic ID Standard (ERC-7857) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Text & Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6 order-2 lg:order-1"
          >
            <Badge variant="outline" className="px-3 py-1 border-indigo-500/40 bg-indigo-500/10 text-indigo-400 font-mono text-xs">
              FINANCIAL PRIMITIVE (ERC-7857)
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Tokenized AI Strategy Reputation & Asset Ownership
            </h2>

            <p className="text-muted-foreground text-sm leading-relaxed">
              Every AI yield strategy is tokenized as a <code className="font-mono text-indigo-300">StrategyAgenticID</code> (ERC-721). The AI model's historical track record, execution efficiency, and verified decisions travel permanently with the token ID—even across ownership transfers.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { label: "Immutable Track Record", desc: "History is bound to Token ID on 0G Chain and is never wiped upon transfer." },
                { label: "Verifiable Trust Primitive", desc: "Buyers verify full historical risk & return before acquiring AI strategy tokens." },
                { label: "Institutional Composability", desc: "Enables strategy marketplaces, performance fees, and DAO governance." },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/50">
                  <Sparkles className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground font-mono">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link to="/agentic-id">
                <Button variant="outline" className="border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 font-mono text-xs">
                  Inspect Strategy Token #0 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Graphic Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 relative group order-1 lg:order-2"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-indigo-500/20 rounded-2xl blur-xl group-hover:opacity-100 transition-opacity opacity-70" />
            <div className="relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-card/80 shadow-2xl">
              <img
                src="/oasis_agentic_reputation.jpg"
                alt="Strategy Agentic ID NFT Primitive"
                className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent flex items-end p-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-indigo-400/40 bg-indigo-500/10 text-indigo-400 font-mono text-xs">
                    0G AGENTIC ID REPUTATION NFT
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    Token #0 · Deployed on Aristotle Mainnet
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
