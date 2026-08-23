import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Loader2, Wallet, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { parseEther, parseUnits, formatUnits, formatEther } from "viem";
import { useAccount, useWriteContract, useReadContract, useBalance } from "wagmi";
import { MAINNET_CONTRACTS, MASTER_VAULT_ABI, MOCK_USDC_ABI, NATIVE_VAULT_ABI, isDeployed } from "@/lib/contracts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface DepositDialogProps {
  vaultId: Id<"vaults">;
  vaultName: string;
}

export function DepositDialog({ vaultId, vaultName }: DepositDialogProps) {
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositToken, setDepositToken] = useState<"USDC" | "0G">("USDC");

  const { address, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { data: balance } = useBalance({ address: address as `0x${string}` });
  const depositMutation = useMutation(api.vaults.deposit);

  const deployed = isDeployed();

  // Read USDC balance
  const { data: usdcBalance } = useReadContract({
    address: MAINNET_CONTRACTS.MOCK_USDC.address as `0x${string}`,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 16661,
    query: { enabled: deployed && !!address },
  });

  const formattedUsdc = usdcBalance ? formatUnits(usdcBalance as bigint, 18) : "0";

  const handleFaucetUSDC = async () => {
    if (!address || !deployed) return;
    try {
      const tx = await writeContractAsync({
        address: MAINNET_CONTRACTS.MOCK_USDC.address as `0x${string}`,
        abi: MOCK_USDC_ABI,
        functionName: "faucet",
        chainId: 16661,
      });
      toast.success("Faucet claimed 10,000 USDC!");
    } catch (err: any) {
      toast.error(err.shortMessage || "Faucet claim failed");
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !amount || Number(amount) <= 0) return;
    setIsDepositing(true);

    try {
      if (depositToken === "0G") {
        const val = parseEther(amount);
        const tx = await writeContractAsync({
          address: MAINNET_CONTRACTS.NATIVE_VAULT.address as `0x${string}`,
          abi: NATIVE_VAULT_ABI,
          functionName: "deposit",
          value: val,
          chainId: 16661,
        });
        toast.success(`Deposited ${amount} 0G into NativeVault!`);
      } else {
        const val = parseUnits(amount, 18);
        // Approve first
        const appTx = await writeContractAsync({
          address: MAINNET_CONTRACTS.MOCK_USDC.address as `0x${string}`,
          abi: MOCK_USDC_ABI,
          functionName: "approve",
          args: [MAINNET_CONTRACTS.MASTER_VAULT.address as `0x${string}`, val],
          chainId: 16661,
        });
        toast.info("USDC approved — submitting deposit...");

        const depTx = await writeContractAsync({
          address: MAINNET_CONTRACTS.MASTER_VAULT.address as `0x${string}`,
          abi: MASTER_VAULT_ABI,
          functionName: "deposit",
          args: [val, address],
          chainId: 16661,
        });
        toast.success(`Deposited ${amount} USDC into MasterVault!`);
      }

      await depositMutation({
        vaultId,
        amount: Number(amount),
        walletAddress: address,
        token: depositToken,
      });

      setIsOpen(false);
      setAmount("");
    } catch (err: any) {
      toast.error(err.shortMessage || "Deposit failed");
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider">
          Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Deposit into {vaultName}</span>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">
              0G Aristotle
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Deposit USDC or native 0G into Oasis yield optimization vaults.
          </DialogDescription>
        </DialogHeader>

        {!deployed ? (
          <Alert className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Contracts not deployed yet on 0G Aristotle. Run <code className="font-mono bg-muted px-1 rounded">npm run deploy:0g</code> first.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleDeposit} className="space-y-4 pt-2">
            <Tabs value={depositToken} onValueChange={(v) => setDepositToken(v as "USDC" | "0G")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="USDC">USDC (MasterVault)</TabsTrigger>
                <TabsTrigger value="0G">Native 0G (NativeVault)</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <Label htmlFor="amount">Amount</Label>
                <span className="text-muted-foreground">
                  Balance: {depositToken === "USDC" ? `${formattedUsdc} USDC` : `${balance ? formatEther(balance.value).slice(0, 8) : "0"} 0G`}
                </span>
              </div>
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {depositToken === "USDC" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                onClick={handleFaucetUSDC}
              >
                Claim Faucet (10,000 Mock USDC)
              </Button>
            )}

            <Button
              type="submit"
              disabled={isDepositing || !amount || Number(amount) <= 0}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider h-11"
            >
              {isDepositing ? <Loader2 className="h-4 w-4 animate-spin" /> : `Deposit ${depositToken}`}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}