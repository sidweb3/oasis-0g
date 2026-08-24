/**
 * Oasis Protocol — Contract Addresses & ABIs
 * Network: 0G Chain Aristotle Mainnet (chainId 16661)
 *
 * Addresses are populated automatically by scripts/deploy-0g.cjs after deployment.
 * Before deployment, all mainnet addresses are empty strings — the UI handles this
 * by showing an explicit "not deployed yet" state rather than silently failing.
 *
 * No Polygon, AggLayer, MATIC, or Amoy references anywhere in this file.
 */

export type NetworkMode = "mainnet";

// ─── 0G Aristotle Mainnet Contracts ─────────────────────────────────────────
// Auto-populated by scripts/deploy-0g.cjs after deployment
export const MAINNET_CONTRACTS = {
  MASTER_VAULT: {
    address: "" as `0x${string}`,
    chainId: 16661,
    explorer: "https://chainscan.0g.ai",
  },
  NATIVE_VAULT: {
    address: "0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3" as `0x${string}`,
    chainId: 16661,
    explorer: "https://chainscan.0g.ai/address/0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3",
  },
  MOCK_USDC: {
    address: "" as `0x${string}`,
    chainId: 16661,
    explorer: "https://chainscan.0g.ai",
    note: "0G Aristotle Mainnet Vault Asset.",
  },
  REBALANCE_EXECUTOR: {
    address: "0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d" as `0x${string}`,
    chainId: 16661,
    explorer: "https://chainscan.0g.ai/address/0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d",
  },
  DEMO_YIELD_ADAPTER: {
    address: "0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E" as `0x${string}`,
    chainId: 16661,
    explorer: "https://chainscan.0g.ai/address/0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E",
    note: "0G Chain Yield Rebalancing Adapter.",
  },
  STRATEGY_AGENTIC_ID: {
    address: "0x78A8ba224b0972aa842438B184fc99BB6afd7950" as `0x${string}`,
    chainId: 16661,
    explorer: "https://chainscan.0g.ai/address/0x78A8ba224b0972aa842438B184fc99BB6afd7950",
  },
} as const;

export const CONTRACTS = MAINNET_CONTRACTS;

export function getContracts(_mode?: NetworkMode) {
  return MAINNET_CONTRACTS;
}

export function isDeployed(): boolean {
  return MAINNET_CONTRACTS.NATIVE_VAULT.address.length > 0;
}

// ─── ABIs ────────────────────────────────────────────────────────────────────

export const MASTER_VAULT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "assets", "type": "uint256" },
      { "internalType": "address", "name": "receiver", "type": "address" }
    ],
    "name": "deposit",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "shares", "type": "uint256" },
      { "internalType": "address", "name": "receiver", "type": "address" },
      { "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "withdraw",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTVL",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalAssets",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "assets_", "type": "uint256" }],
    "name": "convertToShares",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "shares_", "type": "uint256" }],
    "name": "convertToAssets",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "performanceFeeBps",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "name": "user",   "type": "address" },
      { "indexed": false, "name": "assets", "type": "uint256" },
      { "indexed": false, "name": "shares", "type": "uint256" }
    ],
    "name": "Deposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "name": "user",        "type": "address" },
      { "indexed": false, "name": "assets",      "type": "uint256" },
      { "indexed": false, "name": "shares",      "type": "uint256" },
      { "indexed": false, "name": "feeCharged",  "type": "uint256" }
    ],
    "name": "Withdrawn",
    "type": "event"
  }
] as const;

export const NATIVE_VAULT_ABI = [
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "balanceOfAssets",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalAssets",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalValueLocked",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTVL",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const REBALANCE_EXECUTOR_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "vault", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "requestRebalance",
    "outputs": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRebalanceCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllRebalanceIds",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "name": "requestId",    "type": "uint256" },
      { "indexed": true,  "name": "targetAdapter", "type": "address" },
      { "indexed": false, "name": "amount",        "type": "uint256" },
      { "indexed": false, "name": "decisionHash",  "type": "bytes32" },
      { "indexed": false, "name": "storageRef",    "type": "string"  }
    ],
    "name": "RebalanceExecuted",
    "type": "event"
  }
] as const;

export const STRATEGY_AGENTIC_ID_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "metadata",
    "outputs": [
      { "internalType": "string",  "name": "storageRef",    "type": "string"  },
      { "internalType": "string",  "name": "name",          "type": "string"  },
      { "internalType": "uint256", "name": "activatedAt",   "type": "uint256" },
      { "internalType": "uint256", "name": "decisionCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "decisionCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalStrategies",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const MOCK_USDC_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount",  "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "faucet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ─── Deployment Info (auto-populated by deploy-0g.cjs) ───────────────────────
export const DEPLOYMENT_INFO = {
  timestamp:  "",
  deployer:   "",
  network:    "0G Chain Aristotle (chainId 16661)",
  explorer:   "https://chainscan.0g.ai",
  storage:    "https://storagescan.0g.ai",
  compute:    "https://pc.0g.ai",
} as const;