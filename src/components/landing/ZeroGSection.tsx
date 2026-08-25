import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";

interface Primitive {
  num: string;
  category: string;
  title: string;
  rightTag: string;
  header: string;
  bulletPoints: string[];
  endpoint: string;
  usedByOasis: string;
  sourceUrl: string;
}

const PRIMITIVES: Primitive[] = [
  {
    num: "01",
    category: "CHAIN",
    title: "0G Chain",
    rightTag: "EXECUTION",
    header: "0G CHAIN",
    bulletPoints: [
      "NativeVault & RebalanceExecutor smart contracts",
      "Aristotle Mainnet (Chain ID 16661) high-throughput EVM",
    ],
    endpoint: "evmrpc.0g.ai / chain.0g.ai",
    usedByOasis:
      "NativeVault, RebalanceExecutor, DemoYieldAdapter, and StrategyAgenticID deployed on Aristotle (chainId 16661). All vault deposits and rebalance decisions are recorded on-chain.",
    sourceUrl: "/whitepaper",
  },
  {
    num: "02",
    category: "COMPUTE",
    title: "0G Compute",
    rightTag: "INTELLIGENCE",
    header: "0G COMPUTE",
    bulletPoints: [
      "AI inference",
      "TEE-verified strategy decisions",
    ],
    endpoint: "router-api.0g.ai/v1",
    usedByOasis:
      "Rebalance decisions are generated through verifiable inference before being executed on-chain.",
    sourceUrl: "/agentic-id",
  },
  {
    num: "03",
    category: "STORAGE",
    title: "0G Storage",
    rightTag: "VERIFIABILITY",
    header: "0G STORAGE",
    bulletPoints: [
      "Full decision payload & prompt upload",
      "Byte-level readback verification & root hash",
    ],
    endpoint: "@0gfoundation/0g-storage-ts-sdk",
    usedByOasis:
      "Full decision records (inputs, AI output, reasoning, attestation) uploaded via @0gfoundation/0g-storage-ts-sdk with byte-level readback verification. Root hash stored on-chain.",
    sourceUrl: "/strategies",
  },
  {
    num: "04",
    category: "AGENTIC ID",
    title: "0G Agentic ID",
    rightTag: "IDENTITY",
    header: "0G AGENTIC ID",
    bulletPoints: [
      "ERC-721 tokenized AI strategy identity",
      "Immutable on-chain strategy track record",
    ],
    endpoint: "StrategyAgenticID.sol",
    usedByOasis:
      "The AI strategy is tokenized as an ERC-721 (StrategyAgenticID). Decision history is permanently tied to the token ID and survives ownership transfers — never reset.",
    sourceUrl: "/agentic-id",
  },
  {
    num: "05",
    category: "PAY",
    title: "0G Pay",
    rightTag: "ECONOMICS",
    header: "0G PAY",
    bulletPoints: [
      "Native 0G token performance fee settlement",
      "Compute-credit and fiat payment integration",
    ],
    endpoint: "pc.0g.ai",
    usedByOasis:
      "Vault performance fees are taken in native 0G tokens. 0G Pay (pc.0g.ai) is a fiat/compute-credit service — powering automated relayer compute infrastructure.",
    sourceUrl: "/vaults",
  },
];

export function ZeroGSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(1); // Default open 02 COMPUTE
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    // Auto-expand if hovered for 3 seconds (3000ms)
    hoverTimerRef.current = setTimeout(() => {
      setOpenIndex(index);
    }, 3000);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleRowClick = (index: number) => {
    handleMouseLeave();
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-24 bg-transparent border-t border-border/40 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full px-6 sm:px-10 md:px-16 lg:px-24 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-semibold">
              ARCHITECTURE & INFRASTRUCTURE
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Built on 0G Primitives
          </h2>
          <p className="text-muted-foreground max-w-2xl mt-3 text-sm sm:text-base leading-relaxed">
            Oasis uses five 0G infrastructure components end-to-end. Click any row to inspect technical details (or hover for 3s to auto-preview).
          </p>
        </motion.div>

        {/* Five Typographic Section Rows */}
        <div className="flex flex-col space-y-4">
          {PRIMITIVES.map((item, index) => {
            const isActive = openIndex === index;
            const isHovered = hoveredIndex === index && !isActive;

            return (
              <div
                key={item.num}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleRowClick(index)}
                className={`group cursor-pointer rounded-xl border transition-all duration-300 ease-out overflow-hidden relative ${
                  isActive
                    ? "bg-cyan-950/25 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.12)]"
                    : "bg-slate-950/40 hover:bg-cyan-950/15 border-cyan-500/15 hover:border-cyan-500/35"
                }`}
              >
                {/* Left vertical accent bar with glow */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ease-out ${
                    isActive
                      ? "bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                      : "bg-transparent group-hover:bg-cyan-500/40"
                  }`}
                />

                {/* Main Row Header */}
                <div className="p-5 sm:p-7 relative">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Number & Category + Title */}
                    <div className="flex items-baseline gap-4 sm:gap-8">
                      <span
                        className={`font-mono text-xl sm:text-2xl font-bold tracking-widest min-w-[2.5rem] transition-colors duration-300 ${
                          isActive
                            ? "text-cyan-400"
                            : "text-muted-foreground/60 group-hover:text-cyan-400/90"
                        }`}
                      >
                        {item.num}
                      </span>

                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                        <span className="font-mono text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest sm:w-28 shrink-0">
                          {item.category}
                        </span>
                        <h3
                          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight transition-colors duration-300 ${
                            isActive
                              ? "text-cyan-300"
                              : "text-foreground group-hover:text-cyan-200"
                          }`}
                        >
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    {/* Right: Tag & Arrow */}
                    <div className="flex items-center justify-between md:justify-end gap-6 pl-10 md:pl-0">
                      <span
                        className={`font-mono text-xs sm:text-sm font-semibold tracking-widest uppercase border px-3 py-1 rounded transition-colors duration-300 ${
                          isActive
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                            : "border-border/60 bg-muted/20 text-muted-foreground group-hover:border-cyan-500/30 group-hover:text-cyan-400"
                        }`}
                      >
                        {item.rightTag}
                      </span>
                      <span
                        className={`text-2xl sm:text-3xl font-mono inline-block transition-transform duration-300 ease-out ${
                          isActive
                            ? "rotate-90 text-cyan-400"
                            : "rotate-0 text-muted-foreground/50 group-hover:text-cyan-400 group-hover:translate-x-1"
                        }`}
                      >
                        →
                      </span>
                    </div>
                  </div>

                  {/* Light subtle divider line below row header */}
                  <div
                    className={`w-full h-[1px] mt-4 transition-colors duration-300 ${
                      isActive
                        ? "bg-cyan-500/30"
                        : "bg-cyan-500/10 group-hover:bg-cyan-500/25"
                    }`}
                  />

                  {/* Hover 3s auto-preview progress bar indicator */}
                  {isHovered && (
                    <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-400/80 animate-[progress_3s_linear_forwards] pointer-events-none" />
                  )}
                </div>

                {/* Expanded Technical Details Reveal */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, y: -6 }}
                      animate={{ height: "auto", opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -6 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 sm:px-7 sm:pb-7">
                        <div className="pt-2 pb-6 px-4 sm:px-8 bg-black/40 border border-cyan-500/25 rounded-lg backdrop-blur-sm shadow-inner">
                          {/* ASCII Divider */}
                          <div className="font-mono text-xs text-cyan-500/30 overflow-hidden whitespace-nowrap select-none mb-6">
                            ────────────────────────────────────────────────────────────────────────────────────────────────────
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            {/* Left Column: Technical Features & Endpoint */}
                            <div className="md:col-span-6 space-y-4">
                              <div className="font-mono text-sm sm:text-base font-extrabold tracking-widest text-cyan-400 uppercase">
                                {item.header}
                              </div>

                              <ul className="space-y-2">
                                {item.bulletPoints.map((pt, idx) => (
                                  <li
                                    key={idx}
                                    className="text-sm text-foreground/90 font-medium flex items-start gap-2.5"
                                  >
                                    <span className="text-cyan-400 font-mono text-xs mt-0.5">
                                      ▪
                                    </span>
                                    <span>{pt}</span>
                                  </li>
                                ))}
                              </ul>

                              <div className="pt-2">
                                <span className="font-mono text-xs bg-slate-900/90 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded inline-block font-semibold shadow-sm">
                                  {item.endpoint}
                                </span>
                              </div>
                            </div>

                            {/* Right Column: USED BY OASIS */}
                            <div className="md:col-span-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-cyan-500/20 pt-6 md:pt-0 md:pl-8">
                              <div className="space-y-3">
                                <div className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                  USED BY OASIS
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {item.usedByOasis}
                                </p>
                              </div>

                              <div className="pt-6 flex justify-end">
                                <Link
                                  to={item.sourceUrl}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:underline uppercase tracking-wider group/link"
                                >
                                  <span>VIEW SOURCE</span>
                                  <span className="text-sm transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5">
                                    ↗
                                  </span>
                                </Link>
                              </div>
                            </div>
                          </div>

                          {/* ASCII Divider Bottom */}
                          <div className="font-mono text-xs text-cyan-500/20 overflow-hidden whitespace-nowrap select-none mt-6">
                            ────────────────────────────────────────────────────────────────────────────────────────────────────
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-xs text-cyan-400/80 mt-12 font-mono"
        >
          Oasis is deployed live on 0G Chain Aristotle Mainnet (Chain ID 16661). All strategy rebalancing operations carry verified TEE attestations.
        </motion.p>
      </div>
    </section>
  );
}




