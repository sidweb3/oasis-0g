# Oasis Protocol — 0G Integration Guide

Exact file and line pointers for every 0G primitive integration.

---

## 1. 0G Chain (Aristotle, chainId 16661)

**Config**: [`hardhat.config.cjs`](../hardhat.config.cjs) — `aristotle` network, RPC `https://evmrpc.0g.ai`, chainId 16661, evmVersion `cancun`.

**Contracts** (all `contracts/`):
- `NativeVault.sol` — Native 0G token vault (active mainnet vault)
- `RebalanceExecutor.sol` — `requestRebalance()` → event → `executeRebalance()` callback with on-chain attestation
- `StrategyAgenticID.sol` — ERC-721, `recordDecision()` keyed by tokenId
- `DemoYieldAdapter.sol` — initial strategy pool placeholder (`⚠ DEMO` labeled explicitly)
- `MasterVault.sol` & `MockUSDC.sol` — tested reference implementations reserved for future stablecoin vault launch when established stablecoins deploy on 0G Chain

**Frontend chain config**: [`src/lib/web3-config.ts`](../src/lib/web3-config.ts) — `ogAristotle` chain definition, single-network wagmi config.

---

## 2. 0G Compute

**Implementation**: [`relayer/src/compute.ts`](../relayer/src/compute.ts)

- Endpoint: `https://router-api.0g.ai/v1` (OpenAI-compatible Chat Completions)
- API key: `OG_COMPUTE_API_KEY` env var — obtained from `https://pc.0g.ai`
- TEE attestation: `x-worker-signature` response header → stored in `computeAttestation` bytes on-chain
- Model: `llama-3.3-70b-instruct` (configurable via `OG_COMPUTE_MODEL` env)

**On-chain recording**: `RebalanceExecutor.executeRebalance()` — takes `bytes calldata computeAttestation` and `bytes32 decisionHash` parameters, both stored in `RebalanceRecord` struct and emitted in `RebalanceExecuted` event.

**Python model** (reference definition): [`relayer/model/predict.py`](../relayer/model/predict.py)  
Used as the reference architecture for the model deployed on 0G Compute. Inference runs on 0G Compute's GPU provider network — NOT locally.

---

## 3. 0G Storage

**Implementation**: [`relayer/src/storage.ts`](../relayer/src/storage.ts)

- SDK: `@0gfoundation/0g-storage-ts-sdk` (TypeScript SDK, indexer pattern)
- Indexer: `https://indexer-storage-turbo.0g.ai` (env `OG_STORAGE_INDEXER_URL`)
- Upload: `uploadDecisionRecord()` → `ZgFile.fromBuffer()` → `Indexer.upload()`
- Verification: `verifyUpload()` — byte-level readback via `Indexer.download()`, compares buffers
- `downloadDecisionRecord(rootHash)` — used by relayer REST API for frontend detail views
- `storageExplorerUrl(rootHash)` → `https://storagescan.0g.ai/tx/<hash>`

**NOT** a hand-rolled HTTP API. Does not use any guessed URL like `storage.0g.ai/api`.

**On-chain recording**: `executeRebalance(… string calldata storageRef)` — the 0G Storage root hash is stored in `RebalanceRecord.storageRef` and emitted in `RebalanceExecuted`.

**StrategyAgenticID**: `recordDecision(tokenId, storageRef, decisionHash)` — each decision's storage ref is recorded per tokenId.

---

## 4. 0G Agentic ID

**Implementation**: [`contracts/StrategyAgenticID.sol`](../contracts/StrategyAgenticID.sol)

- ERC-721 + AccessControl
- `mintStrategy(to, storageRef, name)` — mints strategy token with 0G Storage ref for metadata
- `recordDecision(tokenId, storageRef, decisionHash)` — `RECORDER_ROLE` adds decision to `_history[tokenId][]`
- History is `mapping(uint256 => DecisionRecord[])` — keyed by tokenId, **not** by owner. Transfer does not reset it.
- `getHistory(tokenId)` and `getDecision(tokenId, index)` for enumeration
- `totalStrategies()` for count

---

## 5. 0G Pay

**Honest integration note**:

0G Pay (`https://pc.0g.ai`) is a fiat/Stripe compute credit service. It does **not** expose a smart-contract callable payment interface for on-chain vault operations. We do not claim a `0GPay.sol` integration.

Vault withdrawal fees are charged in the underlying vault asset (USDC for MasterVault, native 0G for NativeVault):
- `MasterVault.performanceFeeBps` (default 50 = 0.5%, max 500 = 5%)
- `NativeVault.performanceFeeBps` (same)

Fees are sent to `feeRecipient` on every withdrawal. This is transparent, auditable on-chain, and does not require any 0G Pay contract interaction.

---

## Relayer REST API

The off-chain relayer exposes three endpoints for the frontend:

| Endpoint | Description |
|---|---|
| `GET /api/decisions` | Last 50 decisions (most recent first) with storageRef, chainscanLink |
| `GET /api/decisions/:storageRef` | Full decision record fetched directly from 0G Storage |
| `GET /api/vault-status` | Live TVL and share supply from 0G Chain |

---

## Test Gate & Live Verification

Before mainnet deploy, run the automated test suite and live-fire verification scripts:

1. **Unit Test Suite**: `npx hardhat test`
   Tests in [`test/Oasis.test.cjs`](../test/Oasis.test.cjs) (24 passing unit tests) cover:
   - Deposit/withdraw with fee calculation
   - Role authorization on `executeRebalance` (`RELAYER_ROLE` enforcement)
   - Reentrancy protection on vault & executor state functions
   - Pause/unpause behavior
   - Double-execution prevention
   - Attestation requirement enforcement (reverts on empty attestation)
   - Timeout / `refundOrHoldOnFailure` fallback path under simulated failure
   - History-survives-transfer for `StrategyAgenticID`

2. **0G Compute Live Verification**: `npx tsx scripts/live_compute_test.js`
   Script in [`scripts/live_compute_test.js`](../scripts/live_compute_test.js):
   - Executes raw HTTP test directly against `https://router-api.0g.ai/v1/models` and prints full response headers (including `x-worker-signature` / TEE attestation).
   - Executes 3 distinct inference requests through production `submitComputeJob()` from [`relayer/src/compute.ts`](../relayer/src/compute.ts) with different market prompts.
   - Asserts non-templated, dynamic response outputs and verifies strict error throwing on invalid credentials.

3. **0G Storage Live Verification**: `npx tsx scripts/live_storage_test.js`
   Script in [`scripts/live_storage_test.js`](../scripts/live_storage_test.js):
   - Performs upload $\rightarrow$ readback cycle against live indexer `https://indexer-storage-turbo.0g.ai`.
   - Compares byte arrays side-by-side to prove exact byte-level match.
   - Simulates unreachable indexer to verify that failed downloads throw real errors instead of silently returning mock/cached data.

