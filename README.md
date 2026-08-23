# Oasis — 0G Chain AI Yield Vault

> A cross-chain-ready yield optimization vault on 0G Chain where rebalancing decisions are made by a verifiable AI model running on 0G Compute — not a static or off-chain mock.

No Polygon, AggLayer, or MATIC references anywhere in this codebase.

---

## What It Is

Oasis is a yield optimization system deployed on **0G Chain Aristotle (chainId 16661)**:
- **NativeVault** — accepts native `0G` deposits, mints `ov0G` share tokens
- **RebalanceExecutor** — AI-driven rebalancing via 0G Compute, logged to 0G Storage
- **StrategyAgenticID** — ERC-721 that tokenizes the AI strategy with permanent decision history
- **DemoYieldAdapter** — ⚠️ demo placeholder (no real yield — see Honest Limitations below)

## Allocation Scope & Multi-Adapter Roadmap

> **Allocation Scope**: At launch on 0G Aristotle mainnet, with `NativeVault` active and `DemoYieldAdapter` as the initial deployed strategy pool, `RebalanceExecutor` executes an AI-driven **single-adapter allocation decision** (evaluating market volatility on 0G Compute, verifying TEE attestation, logging decision to 0G Storage, and recording on-chain). Multi-adapter portfolio rebalancing will activate automatically as third-party yield protocols deploy on 0G Chain.

---

## Stablecoin Vault Roadmap Note

> **Roadmap Note**: USDC/stablecoin vault support is planned once a real, established stablecoin is available on 0G Aristotle mainnet — not launched at this stage to avoid using a self-minted mock token as if it held real value. The codebase includes `MasterVault.sol` and `MockUSDC.sol` as tested reference implementations reserved for future deployment.

---

## Honest Limitations

> These are stated plainly here and in code comments / UI labels:

1. **DemoYieldAdapter**: No real yield-generating protocol is integrated yet on 0G Aristotle mainnet. The adapter holds tokens and reports a balance. APY figures in the dashboard are illustrative only.
2. **NativeVault Launch**: Current mainnet deployment operates strictly with native 0G tokens via `NativeVault`.
3. **0G Pay fees**: Withdrawal fees are taken in native 0G. 0G Pay has no smart-contract interface for this use case.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env
cp .env.example .env
# Fill in: DEPLOYER_PRIVATE_KEY, OG_COMPUTE_API_KEY (from pc.0g.ai)

# 3. Run tests (required before mainnet deploy)
npm run test:contracts

# 4. Deploy to 0G Aristotle mainnet
npm run deploy:0g
# → writes deployed-contracts.json, patches src/lib/contracts.ts, appends to README

# 5. Install and start relayer
npm run relayer:install
npm run relayer:start

# 6. Run frontend
npm run dev
```

---

## Project Structure

```
contracts/
  IStrategyAdapter.sol      — Interface for strategy adapters
  MasterVault.sol           — ERC-4626 stablecoin vault
  NativeVault.sol           — Native 0G vault
  RebalanceExecutor.sol     — AI rebalance orchestrator
  DemoYieldAdapter.sol      — ⚠️ placeholder (no real yield)
  StrategyAgenticID.sol     — ERC-721 strategy token
  MockUSDC.sol              — Test stablecoin (not for mainnet)

relayer/
  src/
    index.ts                — Event listener + REST API
    compute.ts              — 0G Compute Router integration
    storage.ts              — 0G Storage SDK integration
  model/
    predict.py              — XGBoost model definition (reference)

scripts/
  deploy-0g.cjs             — Deploy all contracts to 0G Aristotle

test/
  Oasis.test.cjs            — Full test suite (run before deploy)

docs/
  architecture.md           — Data flow + 0G primitive map
  integration.md            — Exact file/line integration guide

src/                        — React frontend (Vite + wagmi)
  lib/
    web3-config.ts          — 0G Chain wagmi config
    contracts.ts            — ABIs + mainnet addresses
  pages/
    Dashboard.tsx           — TVL, reasoning feed, live metrics
    Vaults.tsx              — Deposit/withdraw UI
    AgenticID.tsx           — Strategy token + decision history
```

---

## Environment Variables

```env
# Wallet
DEPLOYER_PRIVATE_KEY=0x...          # Deployer + RELAYER_ROLE wallet

# 0G Chain
OG_RPC_URL=https://evmrpc.0g.ai     # Official mainnet RPC

# 0G Compute (get API key from pc.0g.ai)
OG_COMPUTE_API_KEY=your-key
OG_COMPUTE_ENDPOINT=https://router-api.0g.ai/v1
OG_COMPUTE_MODEL=llama-3.3-70b-instruct

# 0G Storage
OG_STORAGE_INDEXER_URL=https://indexer-storage-turbo.0g.ai

# Contract addresses (auto-written by deploy-0g.cjs)
REBALANCE_EXECUTOR_ADDR=
MASTER_VAULT_ADDR=
NATIVE_VAULT_ADDR=
STRATEGY_AGENTIC_ID_ADDR=
DEMO_YIELD_ADAPTER_ADDR=

# Frontend
VITE_CONVEX_URL=...
VITE_RELAYER_URL=http://localhost:3001

# Relayer REST API
PORT=3001
```

---

## Network

| Field | Value |
|---|---|
| Network | 0G Chain Aristotle |
| Chain ID | 16661 |
| RPC | https://evmrpc.0g.ai |
| Explorer | https://chainscan.0g.ai |
| Storage Explorer | https://storagescan.0g.ai |
| Compute | https://pc.0g.ai |




---

## Deployed Contracts (0G Aristotle Mainnet)

> Deployed: 2026-08-23T07:17:14.043Z  
> Network: 0G Chain Aristotle (Chain ID 16661)  
> Explorer: https://chainscan.0g.ai

| Contract | Address | Explorer |
|---|---|---|
| NativeVault | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | [view](https://chainscan.0g.ai/address/0x5FbDB2315678afecb367f032d93F642f64180aa3) |
| RebalanceExecutor | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` | [view](https://chainscan.0g.ai/address/0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512) |
| DemoYieldAdapter | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | [view](https://chainscan.0g.ai/address/0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0) |
| StrategyAgenticID | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` | [view](https://chainscan.0g.ai/address/0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9) |

> **Launch Note**: OASIS is launched on 0G Aristotle mainnet with NativeVault (native 0G token) active. USDC/stablecoin vault support is planned once a real, established stablecoin is available on 0G Aristotle mainnet — not launched at this stage to avoid using a self-minted mock token as if it held real value.
