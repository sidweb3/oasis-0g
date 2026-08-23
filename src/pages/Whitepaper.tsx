import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, BookOpen, BrainCircuit, Code, Layers, Lock, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router";

export default function Whitepaper() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-12 px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0 hidden md:block">
            <div className="sticky top-24 space-y-4">
              <div className="font-semibold text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Documentation
              </div>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <nav className="flex flex-col space-y-1 text-sm text-muted-foreground">
                  <a href="#introduction" className="hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-md transition-colors">1. Introduction</a>
                  <a href="#architecture" className="hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-md transition-colors">2. Rebalancing Architecture</a>
                  <a href="#agglayer" className="hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-md transition-colors">3. Real-Time Data</a>
                  <a href="#ai-model" className="hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-md transition-colors">4. Dual Vault System</a>
                  <a href="#security" className="hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-md transition-colors">5. Security</a>
                  <a href="#tokenomics" className="hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-md transition-colors">6. Future Vision</a>
                  <a href="#roadmap" className="hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-md transition-colors">7. Roadmap</a>
                </nav>
              </ScrollArea>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 max-w-4xl space-y-12">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="w-fit">Version 1.0.0</Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Live on 0G Chain</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Oasis Protocol Documentation</h1>
              <p className="text-xl text-muted-foreground">
                AI-driven yield optimization vault on 0G Chain. RebalanceExecutor orchestrates rebalancing driven by 0G Compute, with decisions logged to 0G Storage.
              </p>
              <div className="flex gap-4 pt-4">
                <Link to="/dashboard">
                  <Button>
                    Launch App <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => window.print()}>
                  Download PDF
                </Button>
              </div>
            </div>

            <Separator />

            {/* 1. Introduction */}
            <section id="introduction" className="space-y-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Introduction
              </h2>
              <div className="prose prose-invert max-w-none text-muted-foreground">
                <p>
                  <strong>Oasis</strong> is a verifiable AI yield optimization vault on 0G Chain (Aristotle, chainId 16661).
                  The AI model runs on 0G Compute — not a static rule or off-chain mock — and every decision is
                  logged to 0G Storage with a TEE attestation, then recorded on-chain.
                </p>
                <p>
                  The architecture uses MasterVault (USDC) and NativeVault (native 0G) connected to RebalanceExecutor.
                  The AI strategy is tokenized as an ERC-721 StrategyAgenticID — transfer carries the full decision history.
                </p>
                <p>
                  <strong>Key Features:</strong>
                </p>
                <ul>
                  <li>AI-driven rebalancing via 0G Compute (router-api.0g.ai/v1) with TEE attestation</li>
                  <li>Decision logs on 0G Storage (indexer-storage-turbo.0g.ai), byte-level verified</li>
                  <li>Dual vault: NativeVault (native 0G) + MasterVault (USDC / ERC-4626-style)</li>
                  <li>Strategy tokenized as ERC-721 Agentic ID — decision history survives transfer</li>
                  <li>All contracts on 0G Chain Aristotle — visible on chainscan.0g.ai</li>
                  <li><strong>⚠ DemoYieldAdapter</strong>: placeholder only — no real yield generated at this stage</li>
                </ul>
              </div>
            </section>

            {/* 2. Rebalancing Architecture */}
            <section id="architecture" className="space-y-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Rebalancing Architecture
              </h2>
              <div className="prose prose-invert max-w-none text-muted-foreground mb-6">
                <p>
                  The platform's core innovation is the <strong>RebalanceExecutor</strong> contract that manages yield strategies
                  across vaults. This enables automated allocation of user funds to yield-generating protocols without manual intervention.
                </p>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Layers className="h-5 w-5 text-blue-500" />
                        Smart Contracts
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        <li><strong>NativeVault:</strong> Native 0G token deposits (0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3)</li>
                        <li><strong>RebalanceExecutor:</strong> AI yield strategy orchestrator (0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d)</li>
                        <li><strong>DemoYieldAdapter:</strong> Strategy allocation target (0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E)</li>
                        <li><strong>StrategyAgenticID:</strong> Tokenized AI strategy & audit history (0x78A8ba224b0972aa842438B184fc99BB6afd7950)</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        How Rebalancing Works
                      </h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>User deposits 0G into NativeVault</li>
                        <li>NativeVault authorizes RebalanceExecutor</li>
                        <li>RebalanceExecutor allocates capital to DemoYieldAdapter</li>
                        <li>AI inference via 0G Compute produces verifiable TEE signature</li>
                        <li>Decisions and reasoning uploaded to 0G Storage with root hash recorded on-chain</li>
                      </ol>
                      <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs font-mono">
                        <strong>Live Mainnet TX:</strong>
                        <br />
                        <a href="https://chainscan.0g.ai/tx/0x66dbcf103a410bacf0384f05484fb0f1d36164a308e9b071d9b7943696afa61c" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                          0x66dbcf103a410bacf0384f05484fb0f1d36164a308e9b071d9b7943696afa61c
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 3. Real-Time Data */}
            <section id="agglayer" className="space-y-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Real-Time Data Architecture
              </h2>
              <p className="text-muted-foreground">
                All platform data is pulled directly from smart contracts in real-time using Wagmi's useReadContract hooks. Every metric you see is live from 0G Chain Aristotle mainnet (Chain ID 16661).
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-muted/20">
                  <CardHeader>
                    <CardTitle className="text-base">Live TVL Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    useReadContract hooks query totalValueLocked() and getTVL() directly from NativeVault.
                  </CardContent>
                </Card>
                <Card className="bg-muted/20">
                  <CardHeader>
                    <CardTitle className="text-base">Balance Updates</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    User vault shares (ov0G) updated instantly via balanceOf() queries on NativeVault.
                  </CardContent>
                </Card>
                <Card className="bg-muted/20">
                  <CardHeader>
                    <CardTitle className="text-base">Deposit History</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Every deposit recorded in Convex with timestamp, tx hash, and 0G ChainScan links.
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* 4. Vault System */}
            <section id="ai-model" className="space-y-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                Native 0G Vault System
              </h2>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4 text-muted-foreground">
                  <p>
                    The platform features a production-ready Native 0G Vault, designed for automated, verifiable AI yield optimization:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>NativeVault (0G):</strong> Accepts native 0G gas token deposits with 1-transaction flow</li>
                    <li>Connected to RebalanceExecutor for verifiable AI decision execution</li>
                    <li>Mints receipt tokens (ov0G) representing user shares 1:1 with TVL</li>
                    <li>Integrated with 0G Compute for TEE-signed rebalancing & 0G Storage for reasoning audit logs</li>
                  </ul>
                </div>
                <Card className="w-full md:w-80 shrink-0 border-cyan-500/20 bg-cyan-500/5">
                  <CardHeader>
                    <CardTitle className="text-sm font-mono">Vault Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span>NativeVault:</span>
                      <a href="https://chainscan.0g.ai/address/0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">0xBe08...5FF3</a>
                    </div>
                    <div className="flex justify-between">
                      <span>RebalanceExecutor:</span>
                      <a href="https://chainscan.0g.ai/address/0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">0x36F7...b35d</a>
                    </div>
                    <div className="flex justify-between">
                      <span>DemoYieldAdapter:</span>
                      <a href="https://chainscan.0g.ai/address/0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">0xB71a...7F1E</a>
                    </div>
                    <div className="flex justify-between">
                      <span>APY:</span>
                      <span className="text-green-500">5.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network:</span>
                      <span className="text-primary">Polygon Amoy</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* 5. Security */}
            <section id="security" className="space-y-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
                Security
              </h2>
              <div className="prose prose-invert max-w-none text-muted-foreground mb-6">
                <p>
                  The platform implements multiple security layers using industry-standard patterns from OpenZeppelin:
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">ReentrancyGuard</h3>
                    <p className="text-sm text-muted-foreground">All deposit/withdraw functions protected against reentrancy attacks</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <Lock className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">SafeERC20</h3>
                    <p className="text-sm text-muted-foreground">Secure token transfers using OpenZeppelin SafeERC20 library</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Code className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">ERC-4626 Standard</h3>
                    <p className="text-sm text-muted-foreground">MasterVault follows battle-tested ERC-4626 vault standard</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">Ownership Controls</h3>
                    <p className="text-sm text-muted-foreground">Rebalancing operations restricted to authorized addresses only</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/20 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> All contracts are deployed on testnet for demonstration. Production deployment would include
                  comprehensive audits, additional security measures, and gradual rollout with conservative limits.
                </p>
              </div>
            </section>

            {/* 6. Future Vision */}
            <section id="tokenomics" className="space-y-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
                Future Vision
              </h2>
              <p className="text-muted-foreground">
                The current implementation demonstrates automated rebalancing on a single chain. The platform is designed to scale
                across Polygon PoS and zkEVM via AggLayer for unified cross-chain liquidity.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">AggLayer Integration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                            <li><strong>Cross-Chain Vaults:</strong> Deploy vaults on Polygon PoS + zkEVM</li>
                            <li><strong>Unified Liquidity:</strong> Users deposit on any chain, yield anywhere</li>
                            <li><strong>Gas Optimization:</strong> Batch rebalancing operations via AggLayer</li>
                            <li><strong>Seamless UX:</strong> Single interface for multi-chain yield</li>
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Multi-Strategy Support</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                            <li><strong>Real Aave V3:</strong> Replace MockAaveAdapter with production Aave</li>
                            <li><strong>Compound Integration:</strong> Add Compound lending strategies</li>
                            <li><strong>Liquidity Pools:</strong> DEX liquidity provision strategies</li>
                            <li><strong>Dynamic Optimization:</strong> Automatically switch between best yields</li>
                        </ul>
                    </CardContent>
                </Card>
              </div>
            </section>

            {/* 7. Roadmap */}
            <section id="roadmap" className="space-y-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">7</span>
                Roadmap
              </h2>
              <div className="relative border-l border-primary/20 ml-4 space-y-8 pl-8 py-2">
                <div className="relative">
                    <div className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-background bg-green-500 flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-full" />
                    </div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        Phase 1: Inception (Q4 2025)
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
                    </h3>
                    <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground line-through opacity-70">
                        <li>Launch MasterVault on Polygon Amoy Testnet</li>
                        <li>Deploy RebalanceExecutor on zkEVM Cardona</li>
                        <li>Train XGBoost model on historical data</li>
                        <li>Release Whitepaper v1.0</li>
                    </ul>
                </div>
                <div className="relative">
                    <div className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-background bg-primary animate-pulse" />
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        Phase 2: Expansion (Q1 2026)
                        <Badge variant="default" className="text-xs">Current Focus</Badge>
                    </h3>
                    <ul className="mt-2 list-disc list-inside text-sm text-foreground font-medium">
                        <li>Mainnet Launch on Polygon zkEVM</li>
                        <li>Integrate Aave V3 and QuickSwap V3 strategies</li>
                        <li>Security Audit by Halborn</li>
                        <li>Token Generation Event (TGE)</li>
                    </ul>
                </div>
                <div className="relative">
                    <div className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-background bg-muted flex items-center justify-center">
                        <div className="h-2 w-2 bg-muted-foreground/50 rounded-full" />
                    </div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-muted-foreground">
                        Phase 3: Decentralization (Q2 2026)
                        <Badge variant="outline" className="text-xs">Upcoming</Badge>
                    </h3>
                    <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                        <li>Launch DAO Governance</li>
                        <li>Enable permissionless strategy creation</li>
                        <li>Cross-chain expansion to Ethereum Mainnet via AggLayer</li>
                    </ul>
                </div>
                 <div className="relative">
                    <div className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-background bg-muted flex items-center justify-center">
                        <div className="h-2 w-2 bg-muted-foreground/50 rounded-full" />
                    </div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-muted-foreground">
                        Phase 4: AI Singularity (Q3-Q4 2026)
                        <Badge variant="outline" className="text-xs">Upcoming</Badge>
                    </h3>
                    <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                        <li>Launch V2 AI Model with LSTM & Transformer architecture</li>
                        <li>Institutional API for white-label integration</li>
                        <li>Cross-chain flash loans for arbitrage opportunities</li>
                        <li>Mobile App Beta Release</li>
                    </ul>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}