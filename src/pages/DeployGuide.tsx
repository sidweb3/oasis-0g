import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Terminal, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router";

export default function DeployGuide() {
  return (
    <>
      <Navbar />
      <div className="container max-w-4xl py-12 space-y-8">
        <div className="space-y-4">
          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
            0G Aristotle Mainnet (Chain ID 16661)
          </Badge>
          <h1 className="text-4xl font-black tracking-tight">0G Chain Deployment Guide</h1>
          <p className="text-muted-foreground text-lg">
            Deploy Oasis yield vault contracts to 0G Chain Aristotle and start the AI relayer service.
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-mono">
              <Terminal className="h-4 w-4 text-cyan-400" /> 1. Prerequisites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Make sure you have set up your <code className="font-mono bg-muted px-1.5 py-0.5 rounded">.env</code> file:</p>
            <pre className="bg-black/90 p-4 rounded text-xs font-mono text-cyan-300 overflow-x-auto">
{`DEPLOYER_PRIVATE_KEY=0x...          # Funded with native 0G for gas
OG_RPC_URL=https://evmrpc.0g.ai     # Official 0G Aristotle RPC
OG_COMPUTE_API_KEY=your-api-key     # From https://pc.0g.ai
OG_STORAGE_INDEXER_URL=https://indexer-storage-turbo.0g.ai`}
            </pre>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-mono">
              <Code className="h-4 w-4 text-cyan-400" /> 2. Run Local Unit Tests Gate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Unit tests must pass before mainnet deployment:</p>
            <pre className="bg-black/90 p-4 rounded text-xs font-mono text-cyan-300">
              npm run test:contracts
            </pre>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-mono">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" /> 3. Deploy Contracts & Start Relayer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Deploy contracts, patch frontend config, and start the relayer:</p>
            <pre className="bg-black/90 p-4 rounded text-xs font-mono text-cyan-300 overflow-x-auto">
{`# Deploy to 0G Aristotle mainnet
npm run deploy:0g

# Install & start off-chain relayer
npm run relayer:install
npm run relayer:start`}
            </pre>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link to="/dashboard">
            <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">
              Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <a href="https://docs.0g.ai" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              0G Developer Docs <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>
    </>
  );
}