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
      <Card>
        <CardHeader>
          <CardTitle>Deposit History</CardTitle>
          <CardDescription>Connect wallet to see your deposits</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (deposits === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposit History</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (deposits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposit History</CardTitle>
          <CardDescription>No deposits yet. Make your first deposit!</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTxHash = (hash?: string) => {
    if (!hash) return "N/A";
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Deposit History</CardTitle>
        <CardDescription>
          {deposits.length} {deposits.length === 1 ? "deposit" : "deposits"} • Total: {deposits.reduce((sum: number, d: Deposit) => sum + d.amount, 0).toFixed(2)} tokens
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deposits.map((deposit: Deposit, index: number) => (
            <motion.div
              key={deposit._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{deposit.amount} {deposit.token}</span>
                  <Badge variant={deposit.token === "MATIC" ? "default" : "secondary"}>
                    {deposit.token}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {deposit.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {deposit.vaultName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(deposit.timestamp)}
                </div>
              </div>

              {deposit.txHash && (
                <a
                  href={`https://amoy.polygonscan.com/tx/${deposit.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
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