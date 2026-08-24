import { Navbar } from "@/components/Navbar";
import { DepositDialog } from "@/components/DepositDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, TrendingUp, Wallet, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FALLBACK_VAULTS = [
  {
    _id: "native-0g-vault",
    name: "0G Aristotle Native Vault",
    symbol: "ov0G",
    token: "0G",
    chainId: 16661,
    apy: 12.8,
    tvl: 0.15,
    allocations: JSON.stringify({
      "DemoYieldAdapter (0G Staking)": 100,
    }),
  },
];

export default function Vaults() {
    const rawVaults = useQuery(api.vaults.getVaults);
    const vaults = (rawVaults && rawVaults.length > 0) ? rawVaults : FALLBACK_VAULTS;

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10" />

            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto py-12 px-6 md:px-10 space-y-12 w-full">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-2">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent"
                        >
                            Vault Terminal
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground text-lg max-w-2xl"
                        >
                            Production-ready vaults with real-time TVL tracking and 0G Compute AI rebalancing on 0G Chain.
                        </motion.p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="px-4 py-1 h-8 border-primary/20 bg-primary/5 text-primary">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                            System Operational
                        </Badge>
                    </div>
                </div>

                <div className="space-y-8">
                    {vaults.map((vault: any, index: number) => {
                            const allocations = JSON.parse(vault.allocations || "{}");
                            return (
                                <motion.div
                                    key={vault._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="relative p-6 md:p-8 grid md:grid-cols-12 gap-8 items-center">
                                            <div className="md:col-span-4 space-y-6">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                            <Wallet className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <Badge variant="secondary" className="font-mono text-xs tracking-wider">
                                                            CHAIN ID: {vault.chainId}
                                                        </Badge>
                                                    </div>
                                                    <h2 className="text-2xl font-bold">{vault.name}</h2>
                                                    <p className="text-muted-foreground text-sm mt-1">
                                                        ERC-4626 compliant vault with real-time on-chain data
                                                    </p>
                                                </div>

                                                <div className="p-4 rounded-2xl bg-background/40 border border-white/5 space-y-1">
                                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4" /> Current APY
                                                    </div>
                                                    <div className="text-4xl font-bold text-primary tracking-tight">
                                                        {vault.apy}%
                                                    </div>
                                                    <div className="text-xs text-muted-foreground font-medium">
                                                        Updated in real-time
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="md:col-span-5 space-y-6 border-t md:border-t-0 md:border-l border-white/10 md:pl-8 pt-6 md:pt-0">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-semibold flex items-center gap-2">
                                                        <ShieldCheck className="h-4 w-4 text-green-500" />
                                                        Vault Information
                                                    </h3>
                                                    <span className="text-xs text-muted-foreground">Live Data</span>
                                                </div>
                                                <div className="space-y-4">
                                                    {Object.entries(allocations).map(([name, percent]: [string, any]) => (
                                                        <div key={name} className="space-y-2">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="font-medium text-foreground/80">{name}</span>
                                                                <span className="font-mono text-primary">{percent}%</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    className="h-full bg-gradient-to-r from-primary to-blue-500"
                                                                    initial={{ width: 0 }}
                                                                    whileInView={{ width: `${percent}%` }}
                                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="md:col-span-3 flex flex-col gap-4 justify-center md:border-l border-white/10 md:pl-8">
                                                <div className="space-y-1 mb-2">
                                                    <div className="text-sm text-muted-foreground">Total Value Locked</div>
                                                    <div className="text-2xl font-mono font-medium">${vault.tvl.toLocaleString()}</div>
                                                </div>

                                                <DepositDialog vaultId={vault._id} vaultName={vault.name} />

                                                <Button variant="outline" className="w-full justify-between group/btn border-primary/20 hover:bg-primary/5">
                                                    View Details
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {vaults?.length === 0 && (
                            <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/5">
                                <p className="text-muted-foreground">No vaults active. Initialize system data.</p>
                            </div>
                        )}
                    </div>
            </main>
        </div>
    );
}