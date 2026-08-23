import { CodeBlock } from "./DeployShared";

export function UpdateConfigSection() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        After deploying, update <code className="bg-muted px-1 rounded text-xs">src/lib/contracts.ts</code> with your new mainnet addresses in the <code className="bg-muted px-1 rounded text-xs">MAINNET_CONTRACTS</code> object:
      </p>
      <CodeBlock language="typescript" code={`// src/lib/contracts.ts — MAINNET_CONTRACTS section
export const MAINNET_CONTRACTS = {
  MASTER_VAULT: {
    address: "0x<YOUR_MASTER_VAULT_ADDRESS>",
    chainId: 137,
    explorer: "https://polygonscan.com/address/0x<YOUR_MASTER_VAULT_ADDRESS>",
  },
  MOCK_USDC: {
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Real USDC — already set
    chainId: 137,
    explorer: "https://polygonscan.com/address/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  },
  POL_VAULT: {
    address: "0x<YOUR_POL_VAULT_ADDRESS>",
    chainId: 137,
    explorer: "https://polygonscan.com/address/0x<YOUR_POL_VAULT_ADDRESS>",
  },
  REBALANCE_EXECUTOR: {
    address: "0x<YOUR_REBALANCE_EXECUTOR_ADDRESS>",
    chainId: 137,
    explorer: "https://polygonscan.com/address/0x<YOUR_REBALANCE_EXECUTOR_ADDRESS>",
  },
  // ... rest stays the same
};`} />
      <p className="text-sm text-muted-foreground">Then switch the network toggle in the app navbar to <strong>Mainnet</strong> to use the new contracts.</p>
    </div>
  );
}
