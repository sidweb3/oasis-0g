import { Link } from "react-router";
import { ExternalLink, Layers } from "lucide-react";
import { MAINNET_CONTRACTS } from "@/lib/contracts";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card relative">
      {/* Top section */}
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/oasis-emblem.svg" alt="Oasis Emblem" className="h-9 w-9 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
              <span className="font-black text-lg tracking-tight">
                OASIS <span className="text-cyan-400">0G</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-xs">
              Verifiable AI yield optimization vault on 0G Chain. Dual ERC-4626 vaults, 0G Compute AI decision engine, 0G Storage reasoning logs, and tokenized Strategy Agentic IDs.
            </p>
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
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