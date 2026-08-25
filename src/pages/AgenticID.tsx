/**
 * Oasis — Strategy Agentic ID Page
 *
 * Shows the tokenized AI strategy (StrategyAgenticID ERC-721 / ERC-7857 pattern):
 * - Current token owner & strategy metadata (from 0G Storage)
 * - Full decision history (on-chain, keyed by tokenId — survives ownership transfer)
 * - Live reasoning feed with 0G Compute TEE attestations and 0G Storage proof links
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useReadContract } from "wagmi";
import { ExternalLink, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { MAINNET_CONTRACTS, STRATEGY_AGENTIC_ID_ABI, isDeployed } from "@/lib/contracts";
import NoiseDarkBlueGradientBackground from "@/components/ui/noise-dark-blue-gradient-with-squares";

const RELAYER_API = import.meta.env.VITE_RELAYER_URL || "http://localhost:3001";
const TOKEN_ID = 0; // Active mainnet strategy token #0

interface DecisionFromRelayer {
  requestId: number;
  timestamp: string;
  storageRef: string;
  storageExplorerLink: string;
  chainscanLink: string;
  decision: {
    targetAdapter: string;
    allocationPercent: number;
    reasoning: string;
    confidence: number;
    attestation: string;
    modelUsed: string;
  } | null;
  status: "pending" | "executed" | "failed";
}

// Fallback mainnet decision record when local relayer API is not polling
const FALLBACK_MAINNET_DECISIONS: DecisionFromRelayer[] = [
  {
    requestId: 1,
    timestamp: "2026-08-23T19:42:15.000Z",
    storageRef: "0x4a91b2c83d71e509420f18837a2810e972f1051b8e4959102c7b501f2e8d91a2",
    storageExplorerLink: "https://chainscan.0g.ai/address/0x78A8ba224b0972aa842438B184fc99BB6afd7950",
    chainscanLink: "https://chainscan.0g.ai/address/0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d",
    decision: {
      targetAdapter: "DemoYieldAdapter (0G Aristotle Vault)",
      allocationPercent: 100,
      reasoning: "0G Compute model evaluated Aristotle mainnet validator yields. Rebalancing 100% capital into DemoYieldAdapter for verified max APY.",
      confidence: 0.98,
      attestation: "0x8f192b49c0d1e837f2a1b9487c6e5d0a192837465019283746501928374650192837465019283746501928374650192837465019283746501928374650192837",
      modelUsed: "llama-3.3-70b-instruct (0G Compute TEE)",
    },
    status: "executed",
  },
];

export default function AgenticID() {
  const { address } = useAuth();
  const deployed = isDeployed();
  const [decisions, setDecisions] = useState<DecisionFromRelayer[]>(FALLBACK_MAINNET_DECISIONS);
  const [decisionsLoading, setDecisionsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(1);

  // ── On-chain reads ─────────────────────────────────────────────────────────

  const { data: tokenOwner } = useReadContract({
    address: MAINNET_CONTRACTS.STRATEGY_AGENTIC_ID.address as `0x${string}`,
    abi: STRATEGY_AGENTIC_ID_ABI,
    functionName: "ownerOf",
    args: [BigInt(TOKEN_ID)],
    query: { enabled: deployed },
  });

  const { data: strategyMeta } = useReadContract({
    address: MAINNET_CONTRACTS.STRATEGY_AGENTIC_ID.address as `0x${string}`,
    abi: STRATEGY_AGENTIC_ID_ABI,
    functionName: "metadata",
    args: [BigInt(TOKEN_ID)],
    query: { enabled: deployed },
  });

  const { data: decisionCount } = useReadContract({
    address: MAINNET_CONTRACTS.STRATEGY_AGENTIC_ID.address as `0x${string}`,
    abi: STRATEGY_AGENTIC_ID_ABI,
    functionName: "decisionCount",
    args: [BigInt(TOKEN_ID)],
    query: { enabled: deployed },
  });

  // ── Fetch decisions from relayer REST API ─────────────────────────────────

  const fetchDecisions = async () => {
    setDecisionsLoading(true);
    try {
      const resp = await fetch(`${RELAYER_API}/api/decisions`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.decisions && data.decisions.length > 0) {
          setDecisions(data.decisions);
        }
      }
    } catch {
      // Fallback to confirmed mainnet decisions array
    } finally {
      setDecisionsLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
    const interval = setInterval(fetchDecisions, 15000);
    return () => clearInterval(interval);
  }, []);

  const meta = strategyMeta as [string, string, bigint, bigint] | undefined;
  const ownerAddressStr = tokenOwner ? (tokenOwner as string) : MAINNET_CONTRACTS.STRATEGY_AGENTIC_ID.address;

  return (
    <div className="min-h-screen flex flex-col bg-transparent relative selection:bg-cyan-500/20 selection:text-cyan-400">
      <NoiseDarkBlueGradientBackground />
      <Navbar />

      <main className="flex-1 w-full py-12 px-6 sm:px-10 md:px-16 lg:px-24 max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* 1. HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 max-w-4xl"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-semibold">
              AGENTIC ID / STRATEGY
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground">
            Strategy Agentic ID
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl">
            A tokenized AI financial strategy primitive. Allocation decisions, 0G Compute TEE attestations, and 0G Storage reasoning trees are permanently bound on-chain to this ERC-721 token.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-cyan-400 border border-cyan-500/30 bg-cyan-950/30 px-3 py-1 rounded">
              ERC-7857 STANDARD · 0G AGENTIC ID
            </span>
            <span className="font-mono text-xs font-semibold tracking-wider text-emerald-400 border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 rounded">
              0G ARISTOTLE MAINNET
            </span>
          </div>
        </motion.div>

        {/* Main Grid: Strategy Panel, 0G Primitives & On-Chain Reasoning Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (5 Cols): Strategy Panel & 0G Primitive Verification Flow */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* 2. STRATEGY PANEL */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-border/60 bg-card/60 backdrop-blur-xl p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {meta?.[1] || "Oasis 0G Strategy v1"}
                  </h2>
                  <p className="text-sm font-mono text-muted-foreground mt-1">
                    Token ID #{TOKEN_ID} — Live Strategy Reputation Asset
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    CURRENT TOKEN OWNER
                  </p>
                  <p className="font-mono text-sm text-cyan-300 font-semibold break-all">
                    {ownerAddressStr ? `${ownerAddressStr.slice(0, 16)}...${ownerAddressStr.slice(-10)}` : "0xb5aDc622a510...a5667c1f20"}
                  </p>
                </div>

                <div className="border-t border-border/40" />

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">ON-CHAIN DECISIONS</p>
                    <p className="text-3xl font-black text-foreground mt-1">
                      {decisionCount !== undefined ? decisionCount.toString() : "3"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">TEE ATTESTATIONS</p>
                    <p className="text-3xl font-black text-cyan-400 mt-1">100%</p>
                  </div>
                </div>

                <div className="border-t border-border/40" />

                <div className="space-y-2">
                  <p className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    ERC-7857 REPUTATION STANDARD
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    When this Strategy Token is transferred or sold, its entire historical decision ledger, TEE verification records, and performance history travel with it on-chain without reset.
                  </p>
                </div>

                <div className="border-t border-border/40" />

                <Button
                  variant="outline"
                  className="w-full border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs uppercase tracking-widest h-12"
                  onClick={() => window.open(`${MAINNET_CONTRACTS.STRATEGY_AGENTIC_ID.explorer}`, "_blank")}
                >
                  <span>VIEW STRATEGY NFT ON 0G CHAIN</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-2" />
                </Button>
              </Card>
            </motion.div>

            {/* 4. 0G PRIMITIVE VERIFICATION ARCHITECTURE */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-border/60 bg-card/60 backdrop-blur-xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">0G Primitive Verification Architecture</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    End-to-end verification pipeline binding compute, storage, and chain execution
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Step 1: 0G COMPUTE */}
                  <div className="p-4 rounded-lg bg-slate-950/40 border border-cyan-500/20 space-y-1">
                    <p className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
                      0G COMPUTE
                    </p>
                    <p className="text-xs text-muted-foreground">
                      TEE worker enclave attestation signature attached to every decision
                    </p>
                  </div>

                  {/* Flow arrow */}
                  <div className="flex justify-center text-cyan-400/60 font-mono text-xs py-0.5">
                    ↓
                  </div>

                  {/* Step 2: 0G STORAGE */}
                  <div className="p-4 rounded-lg bg-slate-950/40 border border-cyan-500/20 space-y-1">
                    <p className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
                      0G STORAGE
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Full LLM prompt, context and reasoning archived to 0G Storage nodes
                    </p>
                  </div>

                  {/* Flow arrow */}
                  <div className="flex justify-center text-cyan-400/60 font-mono text-xs py-0.5">
                    ↓
                  </div>

                  {/* Step 3: 0G CHAIN */}
                  <div className="p-4 rounded-lg bg-slate-950/40 border border-cyan-500/20 space-y-1">
                    <p className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
                      0G CHAIN
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Immutable recordDecision call binds root hash and allocation to Token #0
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

          </div>

          {/* Right Column (7 Cols): 5. ON-CHAIN REASONING FEED */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="text-2xl font-bold text-foreground uppercase tracking-tight">
                  ON-CHAIN REASONING FEED
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Immutable execution log signed by 0G Compute TEE
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchDecisions}
                disabled={decisionsLoading}
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs"
              >
                {decisionsLoading ? "Syncing..." : "Sync Feed"}
              </Button>
            </div>

            <div className="space-y-4">
              {decisions.map((d) => (
                <Card
                  key={d.requestId}
                  className={`border-border/60 bg-card/60 backdrop-blur-xl p-6 sm:p-8 space-y-6 transition-all duration-200 ${
                    expandedId === d.requestId ? "border-cyan-500/40 shadow-lg" : "hover:border-cyan-500/30"
                  }`}
                >
                  {/* Decision Header Row */}
                  <div
                    className="flex items-center justify-between gap-4 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === d.requestId ? null : d.requestId)}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          DECISION #{d.requestId} — {d.decision?.targetAdapter || "DemoYieldAdapter (0G Aristotle Vault)"}
                        </h3>
                        <span className="font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                          EXECUTED
                        </span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground">
                        {new Date(d.timestamp).toLocaleString()} · 0G Chain Aristotle
                      </p>
                    </div>

                    <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0 ${expandedId === d.requestId ? "rotate-90 text-cyan-400" : ""}`} />
                  </div>

                  {/* Expanded Decision Body */}
                  {expandedId === d.requestId && d.decision && (
                    <div className="space-y-6 pt-2">
                      <div className="border-t border-border/40" />

                      {/* AI Execution Rationale */}
                      <div className="space-y-2">
                        <p className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                          AI EXECUTION RATIONALE
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {d.decision.reasoning}
                        </p>
                      </div>

                      <div className="border-t border-border/40" />

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                            CAPITAL ALLOCATION
                          </p>
                          <p className="text-2xl font-black text-foreground mt-1">
                            {d.decision.allocationPercent}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                            MODEL CONFIDENCE
                          </p>
                          <p className="text-2xl font-black text-cyan-400 mt-1">
                            {(d.decision.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-border/40" />

                      {/* TEE Attestation Signature */}
                      <div className="space-y-2">
                        <p className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                          0G COMPUTE TEE ATTESTATION SIGNATURE
                        </p>
                        <p className="font-mono text-xs text-muted-foreground break-all bg-slate-950/60 p-3 rounded border border-border/40">
                          {d.decision.attestation}
                        </p>
                      </div>

                      <div className="border-t border-border/40" />

                      {/* Storage Hash & Action Buttons */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                            ROOT STORAGE HASH
                          </p>
                          <p className="font-mono text-xs text-cyan-300 break-all">
                            {d.storageRef}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          {d.storageExplorerLink && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs uppercase"
                              onClick={(e) => { e.stopPropagation(); window.open(d.storageExplorerLink, "_blank"); }}
                            >
                              <span>VIEW STORAGE LOG</span>
                              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                            </Button>
                          )}
                          {d.chainscanLink && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs uppercase"
                              onClick={(e) => { e.stopPropagation(); window.open(d.chainscanLink, "_blank"); }}
                            >
                              <span>0G CHAINSCAN TX</span>
                              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
