import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Terminal, Activity, Cpu } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { MAINNET_CONTRACTS, isDeployed } from "@/lib/contracts";

const TICKER_ITEMS = [
  { label: "0G COMPUTE AI", value: "VERIFIABLE", change: "TEE SIGNED" },
  { label: "0G STORAGE LOGS", value: "IMMUTABLE", change: "READBACK VERIFIED" },
  { label: "REBALANCE EXECUTOR", value: "ACTIVE", change: "ON-CHAIN" },
  { label: "0G CHAIN ARISTOTLE", value: "CHAIN 16661", change: "CONNECTED" },
  { label: "0G AGENTIC ID", value: "ERC-721", change: "TOKENIZED" },
  { label: "MASTER VAULT", value: "USDC", change: "ERC-4626" },
  { label: "NATIVE VAULT", value: "0G", change: "NATIVE" },
];

function TickerBar() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="border-y border-cyan-500/20 bg-cyan-500/5 overflow-hidden py-2 relative">
      <div className="flex animate-ticker whitespace-nowrap" style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-8 font-mono text-xs">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="text-cyan-400 font-bold">{item.value}</span>
            <span className="text-green-400 text-[10px]">{item.change}</span>
            <span className="text-border mx-2">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function TerminalBlock() {
  const [lines, setLines] = useState<string[]>([]);
  const allLines = [
    "$ oasis-relayer init --network 0g-aristotle",
    "> Connecting to RPC: https://evmrpc.0g.ai",
    "> Loading NativeVault (0G)...",
    "> RebalanceExecutor ready",
    "> 0G Compute Router: router-api.0g.ai/v1",
    "> 0G Storage indexer: indexer-storage-turbo.0g.ai",
    "> StrategyAgenticID token #0 loaded",
    "✓ Oasis AI engine ACTIVE on 0G Chain",
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current <= allLines.length) {
        setLines(allLines.slice(0, current));
        current++;
      } else {
        clearInterval(interval);
      }
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-border bg-black/90 rounded-sm p-4 font-mono text-xs shadow-2xl overflow-hidden relative group">
      <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
          <Terminal className="w-3 h-3" /> oasis-relayer — 0G Aristotle
        </span>
      </div>
      <div className="space-y-1.5 min-h-[160px]">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`${
              l.startsWith("$")
                ? "text-cyan-400 font-bold"
                : l.startsWith("✓")
                ? "text-green-400 font-bold"
                : l.startsWith("> 0G")
                ? "text-purple-400"
                : "text-muted-foreground"
            }`}
          >
            {l}
          </div>
        ))}
        {lines.length < allLines.length && (
          <span className="inline-block w-2 h-3 bg-cyan-400 animate-pulse" />
        )}
      </div>
    </div>
  );
}

interface HeroSectionProps {
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}

export function HeroSection({ sectionRef }: HeroSectionProps = {}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const dx = useSpring(mouseX, springConfig);
  const dy = useSpring(mouseY, springConfig);

  const x = useTransform(dx, [-0.5, 0.5], [-15, 15]);
  const y = useTransform(dy, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const currentX = (e.clientX - rect.left) / width - 0.5;
    const currentY = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(currentX);
    mouseY.set(currentY);
  };

  const deployed = isDeployed();

  return (
    <>
      <TickerBar />
      <section
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        className="relative py-16 md:py-24 overflow-hidden bg-transparent"
      >
        <div className="w-full px-8 md:px-12 lg:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Headline & CTA (col-span-5) */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3 mb-8"
              >
                <span className="font-mono text-[10px] tracking-[0.032em] text-[#e5ff5d] uppercase font-bold bg-[#e5ff5d]/10 px-3 py-1 rounded-[4px] border border-[#e5ff5d]/30 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#e5ff5d] rounded-full animate-pulse" />
                  0G CHAIN ARISTOTLE (16661)
                </span>
                <span className="font-mono text-[10px] tracking-[0.032em] text-[#9c9c9c] uppercase font-medium">
                  VERIFIABLE AI INFRASTRUCTURE
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-[-0.8px] leading-[0.95] uppercase text-[#f9f9f9] mb-8">
                  VERIFIABLE AI <br />
                  YIELD VAULT <br />
                  <span className="text-[#9c9c9c]">ON 0G CHAIN</span>
                </h1>
                <p className="text-[#9c9c9c] text-sm leading-[1.5] mb-10 max-w-lg font-normal">
                  Rebalancing decisions made by AI models running on 0G Compute, signed inside TEE worker enclaves, permanently logged to 0G Storage, and tokenized as Strategy Agentic IDs.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 mb-12"
              >
                <Link to="/auth">
                  <button className="bg-[#e5ff5d] text-[#111111] hover:bg-[#d6f04e] px-6 py-3 rounded-[4px] font-medium text-xs tracking-wide uppercase flex items-center gap-2 transition-colors">
                    LAUNCH VAULT TERMINAL
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link to="/whitepaper">
                  <button className="border border-[#f9f9f9] text-[#f9f9f9] hover:bg-[#f9f9f9]/10 px-5 py-3 rounded-[4px] font-medium text-xs tracking-[0.032em] uppercase transition-colors">
                    VIEW ARCHITECTURE SPEC
                  </button>
                </Link>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-4 border-t border-[#2b2b2b] pt-6"
              >
                {[
                  { label: "PRIMITIVES", value: "5", sub: "0G Stack" },
                  { label: "VAULTS", value: "2", sub: "USDC + 0G" },
                  { label: "CHAIN ID", value: "16661", sub: "Aristotle" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="font-mono text-lg font-bold text-[#e5ff5d]">{s.value}</div>
                    <div className="text-[10px] text-[#9c9c9c] uppercase tracking-wider mt-1">{s.sub} {s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Center: #hero-dock-target (col-span-2) */}
            <div className="lg:col-span-2 flex justify-center py-6">
              <div
                id="hero-dock-target"
                className="w-36 h-36 rounded-full border border-[#2b2b2b] bg-[#1a1a1a]/40 flex items-center justify-center relative transition-all duration-300 shadow-[0_0_25px_rgba(229,255,93,0.1)]"
              >
                <span className="font-mono text-[9px] text-[#e5ff5d] uppercase tracking-[0.032em] font-bold opacity-60">
                  0G CORE SIGNAL
                </span>
              </div>
            </div>

            {/* Right: Terminal & Contracts card (col-span-5) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ x, y }}
              className="lg:col-span-5"
            >
              <TerminalBlock />

              {/* Deployed Contracts card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-4 border border-border bg-card rounded-sm p-4 font-mono text-xs"
              >
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span className="uppercase tracking-wider text-[10px]">0G Mainnet Contracts (16661)</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { name: "NativeVault", addr: MAINNET_CONTRACTS.NATIVE_VAULT.address },
                    { name: "RebalanceExecutor", addr: MAINNET_CONTRACTS.REBALANCE_EXECUTOR.address },
                    { name: "DemoYieldAdapter", addr: MAINNET_CONTRACTS.DEMO_YIELD_ADAPTER.address },
                    { name: "StrategyAgenticID", addr: MAINNET_CONTRACTS.STRATEGY_AGENTIC_ID.address },
                  ].map((c, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{c.name}</span>
                      <span className="text-cyan-400">
                        {c.addr ? `${c.addr.slice(0, 8)}...${c.addr.slice(-6)}` : "Not deployed"}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}