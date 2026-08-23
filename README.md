# Oasis — Verifiable AI Portfolio Management Infrastructure for 0G

Oasis is the trust layer for AI-managed capital on 0G Chain: a strategy execution engine where every allocation decision is made by a model running on **0G Compute**, cryptographically attested inside a TEE, permanently logged to **0G Storage**, and executed on-chain — auditable end to end, not asserted.

Most "AI vaults" ask you to trust a black box. Oasis makes the black box unnecessary: the decision, the reasoning, and the proof that the claimed model actually ran are all independently verifiable by anyone, on-chain.

No Polygon, AggLayer, or MATIC references anywhere in this codebase.

## What It Is

- **NativeVault** — accepts native 0G deposits, mints `ov0G` share tokens
- **RebalanceExecutor** — AI-driven allocation decisions via 0G Compute, verified with TEE attestation, logged to 0G Storage, executed on-chain
- **StrategyAgenticID** — ERC-721 (ERC-7857 pattern) that tokenizes the AI strategy itself as a portable, ownable asset — its full decision history and track record travel with it, even across ownership transfer
- **DemoYieldAdapter** — the current strategy destination (see Strategy Roadmap below)

## Why This Matters

The hard problem in AI-managed DeFi isn't picking where to allocate — it's proving the AI actually did what it claims, and that its track record is real. That's what Oasis solves:

- **Verifiable execution**: every decision is backed by a TEE attestation from 0G Compute — you're not trusting a screenshot or a claim, you're checking a cryptographic proof.
- **Permanent, portable reasoning**: every decision and its full reasoning is written to 0G Storage, forming an audit trail no one — including us — can quietly edit.
- **A strategy with a real identity**: `StrategyAgenticID` means the AI's track record isn't tied to a UI or a company, it's tied to an on-chain token that can be inspected, compared, and transferred.

This is the infrastructure layer other yield products need to build on. As more strategy destinations come online on 0G — including native validator staking, already live on Aristotle mainnet — Oasis plugs into them without changing the trust model.

## Strategy Roadmap

`DemoYieldAdapter` is the current, minimal strategy destination while additional adapters are integrated. It is explicitly labeled in code and UI as a placeholder — see Honest Limitations below. Native 0G validator staking (delegation, rewards, unbonding — live today on Aristotle) is the leading candidate for the first real yield-generating adapter, with lending/DEX integrations to follow as that infrastructure matures on 0G.

## Stablecoin Vault Roadmap Note

USDC/stablecoin vault support is planned once a real, established stablecoin is available on 0G Aristotle mainnet — not launched at this stage to avoid using a self-minted mock token as if it held real value. The codebase includes `MasterVault.sol` and `MockUSDC.sol` as tested reference implementations reserved for future deployment.

## Honest Limitations

Stated plainly here and in code comments / UI labels — we'd rather you hear it from us than discover it yourself:

- **DemoYieldAdapter**: does not yet route to a real yield-generating protocol. It holds tokens and reports a balance. APY figures in the dashboard are illustrative only. This is the one component actively being upgraded — see Strategy Roadmap above.
- **NativeVault Launch**: current mainnet deployment operates strictly with native 0G tokens via NativeVault.
- **0G Pay fees**: withdrawal fees are taken in native 0G. 0G Pay has no smart-contract interface for this use case at this time.

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
  DemoYieldAdapter.sol      — ⚠️ placeholder (no real yield)
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