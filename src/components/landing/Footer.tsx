import { Link } from "react-router";
import { ExternalLink } from "lucide-react";
import { MAINNET_CONTRACTS } from "@/lib/contracts";
import { CitrineCube } from "@/components/ui/CitrineCube";

export function Footer() {
  return (
    <footer className="border-t border-[#2b2b2b] bg-[#111111] text-[#f9f9f9] relative">
      {/* Top section */}
      <div className="w-full max-w-[1280px] mx-auto px-8 md:px-12 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <CitrineCube size={28} glow={false} />
              <span className="font-medium text-xl tracking-[0.027em] text-[#f9f9f9]">
                OASIS <span className="text-[#e5ff5d]">0G</span>
              </span>
            </Link>
            <p className="text-xs text-[#9c9c9c] leading-relaxed max-w-xs font-normal">
              Verifiable AI yield optimization vault on 0G Chain. Native 0G vaults, 0G Compute TEE decision engine, 0G Storage reasoning logs, and tokenized Strategy Agentic IDs.
            </p>
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.032em] text-[#e5ff5d] uppercase">
              <span className="w-1.5 h-1.5 bg-[#e5ff5d] rounded-full animate-pulse" />
              LIVE ON 0G CHAIN (ARISTOTLE 16661)
            </div>
          </div>

          {/* Product Nav */}
          <div>
            <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Product</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Dashboard", to: "/dashboard" },
                { label: "Vaults", to: "/vaults" },
                { label: "Agentic ID", to: "/agentic-id" },
                { label: "Documentation", to: "/whitepaper" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted-foreground hover:text-cyan-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 0G Aristotle Contracts */}
          <div>
            <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
              0G Mainnet <span className="text-cyan-400">(16661)</span>
            </h3>
            <ul className="space-y-2.5 text-xs font-mono">
              {[
                { name: "NativeVault", link: MAINNET_CONTRACTS.NATIVE_VAULT.explorer },
                { name: "RebalanceExecutor", link: MAINNET_CONTRACTS.REBALANCE_EXECUTOR.explorer },
                { name: "DemoYieldAdapter", link: MAINNET_CONTRACTS.DEMO_YIELD_ADAPTER.explorer },
                { name: "StrategyAgenticID", link: MAINNET_CONTRACTS.STRATEGY_AGENTIC_ID.explorer },
              ].map((c) => (
                <li key={c.name}>
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-cyan-400 transition-colors flex items-center gap-1"
                  >
                    {c.name}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 Oasis Protocol — Verifiable AI Yield Vault on 0G Chain
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono">
            <a href="https://docs.0g.ai" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">0G Docs</a>
            <a href="https://pc.0g.ai" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">0G Compute</a>
            <a href="https://chainscan.0g.ai" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">ChainScan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}