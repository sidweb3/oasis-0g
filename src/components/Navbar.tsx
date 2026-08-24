import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Wallet, Globe, Menu, X, Layers } from "lucide-react";
import { Link, useLocation } from "react-router";
import { toast } from "sonner";
import { useState } from "react";
import { isDeployed } from "@/lib/contracts";

export function Navbar() {
  const { isAuthenticated, signOut, address } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/vaults", label: "Vaults" },
    { to: "/strategies", label: "Strategies" },
    { to: "/agentic-id", label: "Agentic ID" },
    { to: "/whitepaper", label: "Whitepaper" },
  ];

  const handleNetworkClick = () => {
    toast.info("Oasis runs on 0G Chain Aristotle (Chain ID 16661). Add it to your wallet at https://docs.0g.ai", {
      duration: 5000,
    });
  };

  const deployed = isDeployed();

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
      <div className="w-full px-8 md:px-12 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-black text-base tracking-tight">
          <img src="/oasis-emblem.svg" alt="Oasis Emblem" className="h-9 w-9 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
          <span>
            OASIS <span className="text-cyan-400">0G</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3.5 py-1.5 text-sm font-medium transition-colors rounded-md ${
                location.pathname === l.to
                  ? "text-cyan-400 bg-cyan-500/10 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* 0G Chain network badge */}
          <button
            onClick={handleNetworkClick}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 border rounded-sm font-mono text-[11px] font-semibold transition-all duration-200 cursor-pointer uppercase tracking-wider ${
              deployed
                ? "border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
            }`}
            title="0G Chain Aristotle Mainnet (Chain ID 16661)"
          >
            <Globe className="h-3 w-3" />
            {deployed ? "0G Mainnet" : "Not Deployed"}
          </button>

          {isAuthenticated && address ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-border rounded-sm font-mono text-xs">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {formatAddress(address)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-xs rounded-sm"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="rounded-sm text-xs font-bold tracking-wider uppercase h-8 px-4 bg-cyan-600 hover:bg-cyan-500">
                <Wallet className="mr-1.5 h-3.5 w-3.5" />
                Connect
              </Button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 text-sm font-medium border-b border-border/50 transition-colors ${
                location.pathname === l.to ? "text-cyan-400 bg-cyan-500/5 font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="px-4 py-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-green-500/40 bg-green-500/10 text-green-400 rounded-sm font-mono text-[11px] font-semibold uppercase tracking-wider">
              <Globe className="h-3 w-3" />
              0G Chain Aristotle
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}