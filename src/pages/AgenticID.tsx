/**
 * Oasis — Strategy Agentic ID Page
 *
 * Shows the tokenized AI strategy (StrategyAgenticID ERC-721):
 * - Current token owner
 * - Strategy metadata (from 0G Storage)
 * - Full decision history (on-chain, keyed by tokenId — survives transfer)
 * - Links to 0G Storage decision records and on-chain RebalanceExecuted events
 *
 * Note: History is NOT reset on token transfer. Each decision is permanently
 * associated with the token ID, regardless of who owns it.
 */

import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { MAINNET_CONTRACTS, STRATEGY_AGENTIC_ID_ABI, isDeployed } from "@/lib/contracts";
import { motion } from "framer-motion";
import { Brain, ExternalLink, Shield, Cpu, Database, History, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { toast } from "sonner";

const RELAYER_API = import.meta.env.VITE_RELAYER_URL || "http://localhost:3001";
const TOKEN_ID = 0; // Active strategy is always token #0

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

export default function AgenticID() {
  const { address, isLoading: authLoading } = useAuth();
  const deployed = isDeployed();
  const [decisions, setDecisions] = useState<DecisionFromRelayer[]>([]);
  const [decisionsLoading, setDecisionsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
        setDecisions(data.decisions || []);
      }
    } catch {
      // Relayer not running — show placeholder state
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

  if (!authLoading && !address) {
    return (
      <>
        <Navbar />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Connect your wallet to view the Strategy Agentic ID.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-8 max-w-5xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Strategy Agentic ID</h1>
              <p className="text-sm text-muted-foreground">
                Tokenized AI strategy on 0G Chain — ERC-721 with on-chain decision history
              </p>
            </div>
          </div>
        </motion.div>

        {/* Not deployed state */}
        {!deployed && (
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="flex items-start gap-3 pt-6">
              <Info className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-yellow-400">Contracts not deployed yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Run <code className="font-mono bg-muted px-1 rounded">npm run deploy:0g</code> to deploy to 0G Aristotle mainnet.
                  Once deployed, real on-chain data will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategy Token Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-cyan-500/20 bg-gradient-to-br from-background to-cyan-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-cyan-400" />
                Strategy Token #{TOKEN_ID}
              </CardTitle>
              <CardDescription>0G Agentic ID — ERC-721</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Strategy Name</p>
                <p className="font-semibold">{meta?.[1] || (deployed ? "Loading…" : "Not deployed")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Owner</p>
                <p className="font-mono text-sm break-all">
                  {tokenOwner ? `${(tokenOwner as string).slice(0, 10)}…${(tokenOwner as string).slice(-8)}` : (deployed ? "Loading…" : "—")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Activated</p>
                <p className="text-sm">
                  {meta?.[2] ? new Date(Number(meta[2]) * 1000).toLocaleDateString() : (deployed ? "Loading…" : "—")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Decisions On-chain</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-cyan-400">
                    {decisionCount !== undefined ? decisionCount.toString() : "—"}
                  </span>
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                    history preserved on transfer
                  </Badge>
                </div>
              </div>
              {deployed && MAINNET_CONTRACTS.STRATEGY_AGENTIC_ID.address && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => window.open(`${MAINNET_CONTRACTS.STRATEGY_AGENTIC_ID.explorer}/address/${MAINNET_CONTRACTS.STRATEGY_AGENTIC_ID.address}`, "_blank")}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  View on ChainScan
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-indigo-500/20 bg-gradient-to-br from-background to-indigo-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-indigo-400" />
                Strategy Metadata
              </CardTitle>
              <CardDescription>Stored on 0G Storage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">0G Storage Reference</p>
                <p className="font-mono text-xs break-all text-indigo-300">
                  {meta?.[0] && meta[0] !== "PENDING_UPLOAD" ? meta[0] : (deployed ? "Pending upload after deploy…" : "—")}
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground font-semibold">0G Primitives in use:</p>
                {[
                  { icon: <Cpu className="h-3.5 w-3.5" />, label: "0G Compute", desc: "AI inference decisions" },
                  { icon: <Database className="h-3.5 w-3.5" />, label: "0G Storage", desc: "Decision logs + strategy config" },
                  { icon: <Brain className="h-3.5 w-3.5" />, label: "0G Agentic ID", desc: "This ERC-721 strategy token" },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-2 text-xs">
                    <span className="text-cyan-400">{p.icon}</span>
                    <span className="font-semibold">{p.label}</span>
                    <span className="text-muted-foreground">— {p.desc}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Transfer note:</strong> When this token is transferred,
                  the full decision history (all {decisionCount?.toString() || "0"} records) transfers with it.
                  History is stored by <code className="font-mono bg-muted px-0.5 rounded">tokenId</code> on-chain
                  and is never reset.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decision History / Reasoning Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-cyan-400" />
                <div>
                  <CardTitle className="text-base">Reasoning Feed</CardTitle>
                  <CardDescription>
                    Live log of every rebalance decision — what the AI considered and why.
                    Each record is logged to 0G Storage and attestation-verified via 0G Compute.
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDecisions}
                disabled={decisionsLoading}
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                {decisionsLoading ? "Loading…" : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {decisions.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Brain className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-muted-foreground text-sm">
                  {deployed
                    ? "No decisions yet. Start the relayer and trigger a rebalance to see the reasoning feed."
                    : "Deploy contracts first, then start the relayer to see live decision data here."}
                </p>
                {!deployed && (
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded block mx-auto w-fit">
                    npm run deploy:0g && npm run relayer:start
                  </code>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {decisions.map((d) => (
                  <motion.div
                    key={d.requestId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                      d.status === "executed"
                        ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                        : d.status === "failed"
                        ? "border-red-500/20 bg-red-500/5"
                        : "border-yellow-500/20 bg-yellow-500/5"
                    }`}
                    onClick={() => setExpandedId(expandedId === d.requestId ? null : d.requestId)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge
                          className={`shrink-0 text-xs ${
                            d.status === "executed"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : d.status === "failed"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                          variant="outline"
                        >
                          {d.status}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">
                            Request #{d.requestId} — {d.decision?.targetAdapter || "pending"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(d.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {d.storageExplorerLink && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-indigo-400"
                            onClick={(e) => { e.stopPropagation(); window.open(d.storageExplorerLink, "_blank"); }}
                          >
                            <Database className="h-3 w-3 mr-1" />
                            Storage
                          </Button>
                        )}
                        {d.chainscanLink && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-cyan-400"
                            onClick={(e) => { e.stopPropagation(); window.open(d.chainscanLink, "_blank"); }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Chain
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded reasoning */}
                    {expandedId === d.requestId && d.decision && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-border/50 space-y-3"
                      >
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold mb-1">AI Reasoning</p>
                          <p className="text-sm">{d.decision.reasoning}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Allocation</p>
                            <p className="font-semibold text-cyan-400">{d.decision.allocationPercent}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Confidence</p>
                            <p className="font-semibold">{(d.decision.confidence * 100).toFixed(0)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Model</p>
                            <p className="font-mono text-xs truncate">{d.decision.modelUsed}</p>
                          </div>
                        </div>
                        {d.decision.attestation && (
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold mb-1">0G Compute TEE Attestation</p>
                            <p className="font-mono text-xs text-indigo-300 break-all bg-muted/50 p-2 rounded">
                              {d.decision.attestation.slice(0, 80)}…
                            </p>
                          </div>
                        )}
                        {d.storageRef && (
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold mb-1">0G Storage Root Hash</p>
                            <p className="font-mono text-xs break-all text-indigo-300">{d.storageRef}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
