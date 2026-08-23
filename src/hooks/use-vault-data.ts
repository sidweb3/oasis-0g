import { useBalance, useAccount } from "wagmi";
import { formatEther } from "viem";
import { ogAristotle } from "@/lib/web3-config";

/**
 * Hook to get native 0G balance for the connected wallet on 0G Chain Aristotle
 */
export function useNativeBalance() {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useBalance({
    address,
    chainId: ogAristotle.id,
  });

  return {
    balance: data ? formatEther(data.value) : "0",
    value: data?.value ?? BigInt(0),
    symbol: data?.symbol ?? "0G",
    isLoading,
    refetch,
  };
}