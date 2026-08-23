import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShieldCheck, Loader2, Activity, AlertTriangle, Info } from "lucide-react";
import { motion } from "framer-motion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Strategies() {
    const strategies = useQuery(api.vaults.getStrategies);

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background flex flex-col relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />

                <Navbar />
                <main className="flex-1 container py-12 px-4 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Strategy Intelligence</h1>
                            <p className="text-muted-foreground max-w-xl">
                                Real-time monitoring of underlying yield strategies. Our AI continuously evaluates risk and performance metrics.
                            </p>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>Low Risk</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                <span>Medium Risk</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span>High Risk</span>
                            </div>
                        </div>
                    </div>

                    {strategies === undefined ? (
                        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <div className="rounded-xl border border-white/10 bg-card/30 backdrop-blur-sm overflow-hidden shadow-xl">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="w-[300px]">Strategy Name</TableHead>
                                        <TableHead>Protocol</TableHead>
                                        <TableHead>Chain</TableHead>
                                        <TableHead className="text-right">TVL</TableHead>
                                        <TableHead className="text-right">APY</TableHead>
                                        <TableHead className="text-right">Risk Score</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {strategies?.map((strategy: typeof strategies[number], index: number) => (
                                        <TableRow key={strategy._id} className="hover:bg-white/5 border-white/5 transition-colors group">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {strategy.protocol.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{strategy.name}</div>
                                                        <div className="text-xs text-muted-foreground hidden group-hover:block transition-all">
                                                            ID: {strategy._id.slice(-6)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{strategy.protocol}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-background/50 border-white/10">
                                                    {strategy.chain}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-muted-foreground">
                                                ${strategy.tvl.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-bold text-green-500">{strategy.currentApy}%</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${strategy.riskScore < 4
                                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                                : strategy.riskScore < 7
                                                                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                            }`}>
                                                            {strategy.riskScore}/10
                                                            {strategy.riskScore >= 7 && <AlertTriangle className="h-3 w-3" />}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Risk Score based on volatility, audit status, and TVL stability.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end">
                                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {strategies?.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    No strategies found. Please seed data from the Dashboard.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        <Card className="bg-primary/5 border-primary/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    How Risk is Calculated
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Our AI model aggregates data from 12 different security audits, historical peg stability, and smart contract maturity to assign a dynamic risk score.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-blue-500/5 border-blue-500/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Rebalance Frequency
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Strategies are re-evaluated every block. Rebalancing occurs when the projected yield improvement exceeds gas costs by at least 15%.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-green-500/5 border-green-500/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    Safety First
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    All strategy allocation decisions are made by AI on 0G Compute, logged to 0G Storage, and tokenized as an Agentic ID.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}