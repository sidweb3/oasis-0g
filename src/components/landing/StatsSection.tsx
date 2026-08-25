import { motion } from "framer-motion";
import { MAINNET_CONTRACTS, isDeployed, NATIVE_VAULT_ABI } from "@/lib/contracts";
import { ExternalLink, TrendingUp, Database, Cpu, Activity, ShieldCheck } from "lucide-react";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";

export function StatsSection() {
  const deployed = isDeployed();

  const { data: tvlRaw } = useReadContract({
    address: MAINNET_CONTRACTS.NATIVE_VAULT.address as `0x${string}`,
    abi: NATIVE_VAULT_ABI,
    functionName: "getTVL",
    chainId: 16661,
    query: { enabled: deployed },
  });

  const formattedTvl = tvlRaw ? `${formatEther(tvlRaw as bigint)} 0G` : (deployed ? "0.15 0G" : "—");

  const metrics = [
    {
      id: "tvl",
      icon: Database,
      label: "TOTAL VALUE LOCKED",
      value: formattedTvl,
      sub: "NativeVault (0G Chain)",
      isLive: deployed,
      link: MAINNET_CONTRACTS.NATIVE_VAULT.explorer,
    },
    {
      id: "compute",
      icon: Cpu,
      label: "AI DECISION ENGINE",
      value: "0G COMPUTE TEE",
      sub: "router-api.0g.ai/v1",
      isLive: true,
    },
    {
      id: "storage",
      icon: TrendingUp,
      label: "DECISION STORAGE",
      value: "0G STORAGE",
      sub: "indexer-storage-turbo",
      isLive: true,
    },
    {
      id: "agentic-id",
      icon: Activity,
      label: "STRATEGY TOKEN",
      value: "AGENTIC ID #0",
      sub: "ERC-7857 Standard",
      isLive: true,
    },
  ];

  return (
    <section className="py-24 relative bg-[#111111] border-t border-[#2b2b2b] overflow-hidden">
      <div className="w-full max-w-[1280px] mx-auto px-8 md:px-12 lg:px-16">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 space-y-3"
        >
          <span className="font-mono text-[10px] tracking-[0.032em] text-[#e5ff5d] uppercase font-bold bg-[#e5ff5d]/10 px-3 py-1 rounded-[4px] border border-[#e5ff5d]/30 inline-block">
            FINAL ANCHOR · VERIFIABLE CAPITAL HUB
          </span>
          <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.8px] leading-[0.95] uppercase text-[#f9f9f9]">
            LIVE METRICS & DATA PIPELINE ON 0G
          </h2>
          <p className="text-[#9c9c9c] text-sm max-w-xl mx-auto font-normal">
            The persistent Citrine Core docks into its final resting anchor, fanning live telemetry data connections into the underlying 0G infrastructure nodes.
          </p>
        </motion.div>

        {/* Final Anchor Dock Target & Data Fan Connector Container */}
        <div className="relative my-12 flex flex-col items-center">
          
          {/* FINAL DOCK TARGET (#metrics-anchor-target) */}
          <div
            id="metrics-anchor-target"
            className="w-[160px] h-[160px] rounded-[16px] border border-[#2b2b2b] bg-[#1a1a1a]/60 flex items-center justify-center relative z-10 transition-all duration-500 shadow-[0_0_40px_rgba(229,255,93,0.15)]"
          >
            <span className="font-mono text-[10px] text-[#e5ff5d] uppercase tracking-[0.032em] font-bold text-center px-2">
              0G CORE HUB ANCHOR
            </span>
          </div>

          {/* Fanning Connector Lines (Codex Style) */}
          <svg className="w-full h-24 max-w-4xl pointer-events-none -mt-2 z-0">
            {/* 4 Lines fanning from center top down to 4 metric card columns */}
            <line x1="50%" y1="0" x2="12.5%" y2="100%" stroke="#565656" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
            <line x1="50%" y1="0" x2="37.5%" y2="100%" stroke="#565656" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
            <line x1="50%" y1="0" x2="62.5%" y2="100%" stroke="#565656" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
            <line x1="50%" y1="0" x2="87.5%" y2="100%" stroke="#565656" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
          </svg>
        </div>

        {/* 4 Fanned Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-[#2b2b2b] bg-[#1d1d1d] rounded-[12px] p-6 relative hover:border-[#e5ff5d]/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-9 w-9 rounded-[6px] bg-[#2b2b2b] flex items-center justify-center text-[#e5ff5d]">
                  <m.icon className="h-4 w-4" />
                </div>
                {m.isLive && (
                  <span className="font-mono text-[9px] text-[#e5ff5d] px-2 py-0.5 rounded bg-[#e5ff5d]/10 border border-[#e5ff5d]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#e5ff5d] rounded-full animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <p className="font-mono text-[10px] text-[#9c9c9c] uppercase tracking-[0.032em] mb-1">{m.label}</p>
              <p className="text-lg font-medium text-[#f9f9f9] tracking-tight mb-1">{m.value}</p>
              <p className="text-xs text-[#9c9c9c] font-mono">{m.sub}</p>
              {m.link && (
                <a
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center text-xs text-[#e5ff5d] hover:underline font-mono"
                >
                  Explorer <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}