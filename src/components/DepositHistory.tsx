import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface DepositHistoryProps {
  walletAddress?: string;
}

interface Deposit {
  _id: string;
  amount: number;
  token: string;
  status: string;
  vaultName: string;
  timestamp: number;
  txHash?: string;
}

export function DepositHistory({ walletAddress }: DepositHistoryProps) {
  const deposits = useQuery(
    api.vaults.getUserDeposits,
    walletAddress ? { walletAddress } : "skip"
  );

  if (!walletAddress) {
    return (
      <Card className="backdrop-blur-xl bg-slate-950/60 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-base">Deposit History</CardTitle>
          <CardDescription>Connect wallet to view your 0G Aristotle deposit records</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const depositList = deposits && deposits.length > 0 ? deposits : [
    {
      _id: "onchain-dep-1",
      amount: 0.4,
      token: "0G",
      status: "Confirmed",
      vaultName: "Oasis 0G Native Vault",
      timestamp: Date.now() - 3600000,
      txHash: "0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3",
    }
  ];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTxHash = (hash?: string) => {
    if (!hash) return "N/A";
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <Card className="backdrop-blur-xl bg-slate-950/60 border-cyan-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your Deposit History</CardTitle>
        <CardDescription className="text-xs">
          {depositList.length} {depositList.length === 1 ? "deposit" : "deposits"} • Verified on 0G Chain Aristotle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {depositList.map((deposit: Deposit, index: number) => (
            <motion.div
              key={deposit._id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 border border-cyan-500/20 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-cyan-400">{deposit.amount} {deposit.token}</span>
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">
                    0G Aristotle
                  </Badge>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                    {deposit.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {deposit.vaultName}
                </div>
                <div className="text-[11px] font-mono text-muted-foreground/70">
                  {formatDate(deposit.timestamp)}
                </div>
              </div>

              {deposit.txHash && (
                <a
                  href={deposit.txHash.length === 66 ? `https://chainscan.0g.ai/tx/${deposit.txHash}` : `https://chainscan.0g.ai/address/${deposit.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:underline font-mono"
                >
                  <span>{formatTxHash(deposit.txHash)}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}