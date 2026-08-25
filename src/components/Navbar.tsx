import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Wallet, Globe, Menu, X, Layers } from "lucide-react";
import { Link, useLocation } from "react-router";
import { toast } from "sonner";
import { useState } from "react";
import { isDeployed } from "@/lib/contracts";
import { CitrineCube } from "@/components/ui/CitrineCube";

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
    <nav className="border-b border-[#2b2b2b] bg-[#111111]/95 backdrop-blur sticky top-0 z-50">
      <div className="w-full px-8 md:px-12 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 font-medium text-xl tracking-[0.027em] text-[#f9f9f9]">
          <CitrineCube size={28} glow={false} />
          <span>
            OASIS <span className="text-[#e5ff5d]">0G</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-xs font-medium uppercase tracking-[0.027em] transition-colors ${
                location.pathname === l.to
                  ? "text-[#e5ff5d]"
                  : "text-[#9c9c9c] hover:text-[#f9f9f9]"
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
              <button className="bg-[#e5ff5d] text-[#111111] hover:bg-[#d6f04e] px-4 py-2 rounded-[4px] font-medium text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors">
                <Wallet className="h-3.5 w-3.5" />
                Connect Wallet
              </button>
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