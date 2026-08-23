import { motion } from "framer-motion";
import { MAINNET_CONTRACTS, isDeployed, NATIVE_VAULT_ABI } from "@/lib/contracts";
import { ExternalLink, TrendingUp, Database, Cpu, Activity } from "lucide-react";
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
      icon: Database,
      label: "Total Value Locked",
      value: formattedTvl,
      sub: "NativeVault TVL",
      isLive: deployed,
      link: MAINNET_CONTRACTS.NATIVE_VAULT.explorer,
      accent: "text-cyan-400",
      border: "border-cyan-400/20",
    },
    {
      icon: Cpu,
      label: "AI Decision Engine",
      value: "0G Compute",
      sub: "router-api.0g.ai/v1",
      accent: "text-indigo-400",
      border: "border-indigo-400/20",
    },
    {
      icon: TrendingUp,
      label: "Decision Storage",
      value: "0G Storage",
      sub: "indexer-storage-turbo",
      accent: "text-purple-400",
      border: "border-purple-400/20",
    },
    {
      icon: Activity,
      label: "Strategy Token",
      value: "Agentic ID",
      sub: "ERC-721 on-chain",
      accent: "text-blue-400",
      border: "border-blue-400/20",
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
              Metrics & System Info
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
            Live Metrics on 0G Chain Aristotle
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`border ${m.border} bg-card rounded-xl p-6 relative`}
            >
              <div className="flex items-center justify-between mb-4">
                <m.icon className={`h-5 w-5 ${m.accent}`} />
                {m.isLive && (
                  <span className="font-mono text-[10px] text-green-400 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
              <p className="text-xl font-bold font-mono tracking-tight mb-1">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.sub}</p>
              {m.link && (
                <a
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center text-xs text-cyan-400 hover:underline"
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