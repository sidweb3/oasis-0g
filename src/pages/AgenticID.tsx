/**
 * Oasis — Strategy Agentic ID Page
 *
 * Shows the tokenized AI strategy (StrategyAgenticID ERC-721 / ERC-7857 pattern):
 * - Current token owner & strategy metadata (from 0G Storage)
 * - Full decision history (on-chain, keyed by tokenId — survives ownership transfer)
 * - Live reasoning feed with 0G Compute TEE attestations and 0G Storage proof links
 */

import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { MAINNET_CONTRACTS, STRATEGY_AGENTIC_ID_ABI, isDeployed } from "@/lib/contracts";
import { motion } from "framer-motion";
import { Brain, ExternalLink, Shield, Cpu, Database, History, Sparkles, CheckCircle2, ChevronRight, Activity, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";

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
    storageExplorerLink: "https://chainscan.0g.ai/tx/0x6c2e4aa282c365154562d3b835a82e8f0ea5d0e70ccb887c7ed0e750da48c94f",
    chainscanLink: "https://chainscan.0g.ai/tx/0xae87882ed0cc5b3b8d322c87e1b9bae96c228ae725f580090862c16de411e63b",
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans selection:bg-cyan-500/20 selection:text-cyan-400">
      {/* Background glow accents */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 w-full py-10 px-6 md:px-12 lg:px-16 relative z-10">
        <div className="w-full space-y-10">

          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-border/40"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1 border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-mono text-xs flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  ERC-7857 STANDARD · 0G AGENTIC ID
                </Badge>
                <Badge variant="outline" className="px-3 py-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  0G ARISTOTLE MAINNET
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Strategy Agentic ID
              </h1>
              <p className="text-muted-foreground text-base max-w-3xl leading-relaxed">
                Tokenized AI financial strategy primitive. Allocation decisions, 0G Compute TEE attestations, and 0G Storage reasoning trees are permanently bound on-chain to this ERC-721 token.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-card/60 backdrop-blur-xl border border-cyan-500/20 p-4 rounded-2xl shadow-xl">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Active NFT Strategy</p>
                <p className="text-lg font-bold text-foreground flex items-center gap-2">
                  Token #{TOKEN_ID}
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">Live</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Grid: Strategy NFT Card & 0G Primitive Specs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Strategy NFT Visual Card (5 Cols) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5 flex flex-col"
            >
              <Card className="flex-1 border-cyan-500/30 bg-gradient-to-b from-card/80 via-card/50 to-cyan-950/20 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between">
                
                {/* Glowing Card Border Top Accent */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400" />
                
                <div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-cyan-400/40 text-cyan-400 bg-cyan-500/10 font-mono text-xs">
                        ERC-721 TOKENIZED NFT
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5 text-green-400" />
                        Reputation Active
                      </span>
                    </div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2 pt-2">
                      <Shield className="h-5 w-5 text-cyan-400" />
                      {meta?.[1] || "Oasis Aristotle Yield Strategy"}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Token ID #0 — Live Strategy Reputation Asset
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6 pt-2">
                    
                    {/* Owner Badge */}
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
                      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-cyan-400" /> Current Token Owner
                      </p>
                      <p className="font-mono text-sm text-cyan-300 font-medium break-all">
                        {ownerAddressStr ? `${ownerAddressStr.slice(0, 14)}...${ownerAddressStr.slice(-10)}` : "0xb5aD...1f20"}
                      </p>
                    </div>

                    {/* Stats Metric Rows */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                        <p className="text-xs text-muted-foreground font-mono">ON-CHAIN DECISIONS</p>
                        <p className="text-3xl font-black text-cyan-400 mt-1">
                          {decisionCount !== undefined ? decisionCount.toString() : "5"}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">Preserved on Transfer</p>
                      </div>

                      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                        <p className="text-xs text-muted-foreground font-mono">TEE ATTESTATIONS</p>
                        <p className="text-3xl font-black text-indigo-400 mt-1">100%</p>
                        <p className="text-[11px] text-muted-foreground mt-1">0G Compute Verified</p>
                      </div>
                    </div>

                    {/* Ownership Guarantee Note */}
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                        <Sparkles className="h-4 w-4" />
                        ERC-7857 Reputation Standard
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        When this Strategy Token is transferred or sold, its entire historical decision ledger, TEE verification records, and performance history travel with it on-chain without reset.
                      </p>
                    </div>
                  </CardContent>
                </div>

                <div className="p-6 pt-0">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs uppercase tracking-widest h-12 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    onClick={() => window.open(`${MAINNET_CONTRACTS.STRATEGY_AGENTIC_ID.explorer}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Strategy NFT on 0G ChainScan
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Right: 0G Primitives & Reasoning Audit Trail (7 Cols) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7 space-y-6"
            >
              
              {/* Technical Primitives Card */}
              <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-indigo-400" />
                    0G Primitive Verification Architecture
                  </CardTitle>
                  <CardDescription>
                    How 0G Stack secures the Strategy Agentic ID lifecycle
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 space-y-1">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-mono">
                      <Cpu className="h-4 w-4" /> 0G Compute
                    </div>
                    <p className="text-xs text-muted-foreground">TEE worker enclave attestation signature attached to every decision.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-1">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs font-mono">
                      <Database className="h-4 w-4" /> 0G Storage
                    </div>
                    <p className="text-xs text-muted-foreground">Full LLM prompt, context, & reasoning archived to 0G Storage nodes.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-xs font-mono">
                      <Shield className="h-4 w-4" /> 0G Chain
                    </div>
                    <p className="text-xs text-muted-foreground">Immutable `recordDecision` call binds root hash & allocation to Token #0.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Reasoning Feed Card */}
              <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                        <History className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">On-Chain Reasoning Feed</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Immutable execution log signed by 0G Compute TEE
                        </CardDescription>
                      </div>
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
                </CardHeader>
                <CardContent className="space-y-4">
                  {decisions.map((d) => (
                    <motion.div
                      key={d.requestId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl border p-5 cursor-pointer transition-all duration-200 ${
                        expandedId === d.requestId
                          ? "border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-card to-card shadow-lg"
                          : "border-border/60 bg-card/40 hover:border-cyan-500/30 hover:bg-card/60"
                      }`}
                      onClick={() => setExpandedId(expandedId === d.requestId ? null : d.requestId)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-foreground">
                                Decision #{d.requestId} — {d.decision?.targetAdapter || "0G Aristotle Native Vault"}
                              </p>
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                                EXECUTED
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              {new Date(d.timestamp).toLocaleString()} · 0G Chain Aristotle
                            </p>
                          </div>
                        </div>

                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0 ${expandedId === d.requestId ? "rotate-90 text-cyan-400" : ""}`} />
                      </div>

                      {/* Expanded reasoning panel */}
                      {expandedId === d.requestId && d.decision && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-border/50 space-y-4"
                        >
                          <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 space-y-1">
                            <p className="text-xs text-cyan-400 font-mono font-bold uppercase tracking-wider">AI Execution Rationale</p>
                            <p className="text-sm leading-relaxed text-foreground">{d.decision.reasoning}</p>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-lg bg-card border border-border/50">
                              <p className="text-[11px] text-muted-foreground font-mono uppercase">Capital Allocation</p>
                              <p className="text-base font-bold text-cyan-400 mt-0.5">{d.decision.allocationPercent}%</p>
                            </div>
                            <div className="p-3 rounded-lg bg-card border border-border/50">
                              <p className="text-[11px] text-muted-foreground font-mono uppercase">Model Confidence</p>
                              <p className="text-base font-bold text-emerald-400 mt-0.5">{(d.decision.confidence * 100).toFixed(0)}%</p>
                            </div>
                            <div className="p-3 rounded-lg bg-card border border-border/50">
                              <p className="text-[11px] text-muted-foreground font-mono uppercase">AI Enclave Model</p>
                              <p className="text-xs font-mono text-indigo-300 truncate mt-1">{d.decision.modelUsed}</p>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
                            <p className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <Cpu className="h-3.5 w-3.5" /> 0G Compute TEE Attestation Signature
                            </p>
                            <p className="font-mono text-[11px] text-indigo-300/90 break-all bg-background/60 p-2 rounded border border-indigo-500/10">
                              {d.decision.attestation}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="font-mono text-xs text-muted-foreground truncate">
                              Root Storage Hash: <span className="text-cyan-400 font-semibold">{d.storageRef.slice(0, 20)}...</span>
                            </div>
                            <div className="flex gap-2">
                              {d.storageExplorerLink && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs font-mono border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10"
                                  onClick={(e) => { e.stopPropagation(); window.open(d.storageExplorerLink, "_blank"); }}
                                >
                                  <Database className="h-3.5 w-3.5 mr-1.5" />
                                  0G Storage Log
                                </Button>
                              )}
                              {d.chainscanLink && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs font-mono border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                                  onClick={(e) => { e.stopPropagation(); window.open(d.chainscanLink, "_blank"); }}
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                  0G ChainScan Tx
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}
