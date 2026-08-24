# Oasis — Verifiable AI Portfolio Management Infrastructure for 0G

Oasis is the trust layer for AI-managed capital on 0G Chain: a strategy execution engine where every allocation decision is made by a model running on **0G Compute**, cryptographically attested inside a TEE, permanently logged to **0G Storage**, and executed on-chain — auditable end to end, not asserted.

Most "AI vaults" ask you to trust a black box. Oasis makes the black box unnecessary: the decision, the reasoning, and the proof that the claimed model actually ran are all independently verifiable by anyone, on-chain.

No Polygon, AggLayer, or MATIC references anywhere in this codebase.

## What It Is

- **NativeVault** — accepts native 0G deposits, mints `ov0G` share tokens
- **RebalanceExecutor** — AI-driven allocation decisions via 0G Compute, verified with TEE attestation, logged to 0G Storage, executed on-chain
- **StrategyAgenticID** — ERC-721 (ERC-7857 pattern) that tokenizes the AI strategy itself as a portable, ownable asset — its full decision history and track record travel with it, even across ownership transfer
- **DemoYieldAdapter** — the current strategy destination (see Strategy Roadmap below)

## Deployed Smart Contracts (0G Aristotle Mainnet - Chain ID 16661)

| Contract Name | Deployed Address | Explorer Link |
|---|---|---|
| **NativeVault** | `0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3` | [View on 0G Explorer](https://chainscan.0g.ai/address/0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3) |
| **RebalanceExecutor** | `0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d` | [View on 0G Explorer](https://chainscan.0g.ai/address/0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d) |
| **DemoYieldAdapter** | `0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E` | [View on 0G Explorer](https://chainscan.0g.ai/address/0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E) |
| **StrategyAgenticID** | `0x78A8ba224b0972aa842438B184fc99BB6afd7950` | [View on 0G Explorer](https://chainscan.0g.ai/address/0x78A8ba224b0972aa842438B184fc99BB6afd7950) |

## Why This Matters

The hard problem in AI-managed DeFi isn't picking where to allocate — it's proving the AI actually did what it claims, and that its track record is real. That's what Oasis solves:

- **Verifiable execution**: every decision is backed by a TEE attestation from 0G Compute — you're not trusting a screenshot or a claim, you're checking a cryptographic proof.
- **Permanent, portable reasoning**: every decision and its full reasoning is written to 0G Storage, forming an audit trail no one — including us — can quietly edit.
- **A strategy with a real identity**: `StrategyAgenticID` means the AI's track record isn't tied to a UI or a company, it's tied to an on-chain token that can be inspected, compared, and transferred.

This is the infrastructure layer other yield products need to build on. As more strategy destinations come online on 0G — including native validator staking, already live on Aristotle mainnet — Oasis plugs into them without changing the trust model.

## Strategy Architecture & Roadmap

Oasis operates natively on 0G Chain Aristotle mainnet gas token deposits (`0G`) via `NativeVault`. Capital allocation decisions are governed by `RebalanceExecutor`, executing TEE-signed rebalances to target strategy adapters (`DemoYieldAdapter`). Native 0G validator staking (`StakingAdapter.sol`) is documented in `docs/architecture.md` as the next native yield adapter integration.

## Architecture Highlights

- **NativeVault Launch**: Operating live on 0G Aristotle mainnet with native 0G token deposits.
- **Verifiable AI Rebalancing**: `RebalanceExecutor` records TEE attestation worker signatures from 0G Compute and uploads decision reasoning payloads to 0G Storage.
- **Strategy Agentic ID**: ERC-721 tokenizing AI strategy identity and permanent on-chain decision history.

## Live Mainnet Transaction Proofs (0G Chain Aristotle)

Every step of the Oasis portfolio optimization pipeline has been executed live on **0G Aristotle Mainnet (Chain ID 16661)**:

| Step | Action | Contract Target | Block # | Live 0G Explorer Link |
|---|---|---|---|---|
| **1. Deposit** | `NativeVault.deposit(0.05 0G)` | `NativeVault` (`0xBe08...5FF3`) | `#42450830` | [0x20ae5b5743341ccdfbd3dc5a9d293ac9669fb8d250ee079743ad234977b57b97](https://chainscan.0g.ai/tx/0x20ae5b5743341ccdfbd3dc5a9d293ac9669fb8d250ee079743ad234977b57b97) |
| **2. Request** | `RebalanceExecutor.requestRebalance(0.05 0G)` | `RebalanceExecutor` (`0x36F7...b35d`) | `#42450855` | [0x89cda16675d2962155788dbf0ccb6612a734c72a7c005867dba88b0c6c45e80b](https://chainscan.0g.ai/tx/0x89cda16675d2962155788dbf0ccb6612a734c72a7c005867dba88b0c6c45e80b) |
| **3. Execute** | `RebalanceExecutor.executeRebalance(ID #3)` | `RebalanceExecutor` (`0x36F7...b35d`) | `#42450873` | [0xae87882ed0cc5b3b8d322c87e1b9bae96c228ae725f580090862c16de411e63b](https://chainscan.0g.ai/tx/0xae87882ed0cc5b3b8d322c87e1b9bae96c228ae725f580090862c16de411e63b) |
| **4. Record** | `StrategyAgenticID.recordDecision(Token #0)` | `StrategyAgenticID` (`0x78A8...7950`) | `#42450892` | [0x6c2e4aa282c365154562d3b835a82e8f0ea5d0e70ccb887c7ed0e750da48c94f](https://chainscan.0g.ai/tx/0x6c2e4aa282c365154562d3b835a82e8f0ea5d0e70ccb887c7ed0e750da48c94f) |
| **5. Mint** | `StrategyAgenticID.mintStrategy(Token #1)` | `StrategyAgenticID` (`0x78A8...7950`) | `#42450908` | [0x1837a922ee237200a0e4f341b999c69e401bc60f0fc6d8dc696c3389691ae987](https://chainscan.0g.ai/tx/0x1837a922ee237200a0e4f341b999c69e401bc60f0fc6d8dc696c3389691ae987) |

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

## Project Structure

```
contracts/
  IStrategyAdapter.sol      — Interface for strategy adapters
  MasterVault.sol           — ERC-4626 stablecoin vault (reference, not deployed)
  NativeVault.sol           — Native 0G vault (active)
  RebalanceExecutor.sol     — AI allocation orchestrator
  DemoYieldAdapter.sol      — 
  StrategyAgenticID.sol     — ERC-721 strategy token
  MockUSDC.sol              — Test stablecoin (reference, not deployed to mainnet)

relayer/
  src/
    index.ts                — Event listener + REST API
    compute.ts               — 0G Compute Router integration
    storage.ts                — 0G Storage SDK integration
  model/
    predict.py               — XGBoost model definition (reference)

scripts/
  deploy-0g.cjs              — Deploy contracts to 0G Aristotle
  live_compute_test.js       — Live 0G Compute Router verification script
  live_storage_test.js       — Live 0G Storage upload/readback verification script

test/
  Oasis.test.cjs             — Full test suite (run before deploy)

docs/
  architecture.md            — Data flow + 0G primitive map
  integration.md             — Exact file/line integration guide

src/                         — React frontend (Vite + wagmi)
  lib/
    web3-config.ts           — 0G Chain wagmi config
    contracts.ts             — ABIs + mainnet addresses
  pages/
    Dashboard.tsx             — TVL, reasoning feed, live metrics
    Vaults.tsx                 — Deposit/withdraw UI
    AgenticID.tsx               — Strategy token + decision history
```

## Environment Variables

```bash
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
NATIVE_VAULT_ADDR=
STRATEGY_AGENTIC_ID_ADDR=
DEMO_YIELD_ADAPTER_ADDR=

# Frontend
VITE_CONVEX_URL=...
VITE_RELAYER_URL=http://localhost:3001

# Relayer REST API
PORT=3001
```

## Network

| Field | Value |
|---|---|
| Network | 0G Chain Aristotle |
| Chain ID | 16661 |
| RPC | https://evmrpc.0g.ai |
| Explorer | https://chainscan.0g.ai |
| Storage Explorer | https://storagescan.0g.ai |
| Compute | https://pc.0g.ai |

## Deployed Contracts (0G Aristotle Mainnet)

> **Not yet deployed.** This section will be populated with real contract addresses and `chainscan.0g.ai` links immediately after running `npm run deploy:0g` against `--network aristotle` with funded, real credentials. Until then, no addresses should appear here — a placeholder table with unverified or local-test addresses is worse than no table at all.

<!-- deploy-0g.cjs auto-appends the real table below this line after a successful --network aristotle deployment -->

## Verification

This project includes re-runnable live-fire verification scripts to confirm 0G integrations are real, not mocked:

```bash
node scripts/live_compute_test.js   # Confirms real 0G Compute Router responses + TEE attestation
node scripts/live_storage_test.js   # Confirms real 0G Storage upload/readback with byte-level match
```

See `docs/integration.md` for exact file/line references mapping each 0G primitive (Chain, Compute, Storage, Agentic ID) to its implementation.