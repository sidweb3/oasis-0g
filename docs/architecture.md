# Oasis Protocol — Architecture

> Verifiable AI yield optimization on 0G Chain.  
> Rebalancing decisions are made by AI running on 0G Compute, not a static model or off-chain mock.

---

## Data Flow Diagram

```
User deposits USDC/0G
         │
         ▼
┌─────────────────────┐
│    MasterVault      │  ERC-4626-style, chainId 16661
│    (USDC shares)    │  contracts/MasterVault.sol
│                     │
│  OR NativeVault     │  native 0G deposits
│    (ov0G shares)    │  contracts/NativeVault.sol
└─────────┬───────────┘
          │ EXECUTOR_ROLE authorized call
          ▼
┌─────────────────────┐
│  RebalanceExecutor  │  contracts/RebalanceExecutor.sol
│                     │
│  requestRebalance() │──► emits RebalanceRequested event
│                     │
└─────────┬───────────┘
          │ Off-chain relayer picks up event
          ▼
┌─────────────────────────────────────────────┐
│  0G Compute Router                          │  ← PRIMITIVE 2
│  https://router-api.0g.ai/v1               │
│  API key from pc.0g.ai                      │
│                                             │
│  Input: vault TVL, adapter list, volatility │
│  Output: target adapter, allocation %, why  │
│  + TEE attestation (x-worker-signature)     │
└─────────┬───────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│  0G Storage                                 │  ← PRIMITIVE 3
│  SDK: @0gfoundation/0g-storage-ts-sdk      │
│  Indexer: indexer-storage-turbo.0g.ai       │
│                                             │
│  Stores: { requestId, inputs, decision,     │
│            reasoning, attestation, txHash } │
│  Returns: content root hash (storageRef)    │
│  Verified: byte-level readback after upload │
└─────────┬───────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│  RebalanceExecutor  │
│                     │
│  executeRebalance(  │  Called by relayer (RELAYER_ROLE)
│    requestId,       │
│    vault,           │
│    targetAdapter,   │
│    amount,          │
│    decisionHash,    │  keccak256 of decision JSON
│    computeAttest,   │  TEE signature bytes
│    storageRef       │  0G Storage root hash
│  )                  │
│                     │
│  emits:             │
│    RebalanceExecuted│  on-chain, Explorer-visible
└─────────┬───────────┘
          │
          ├──────────────────────────────────────┐
          ▼                                      ▼
┌──────────────────┐                  ┌─────────────────────┐
│ DemoYieldAdapter │  ← PRIMITIVE 1   │ StrategyAgenticID   │  ← PRIMITIVE 4
│ (placeholder —   │  (0G Chain)      │ contracts/           │
│  no real yield)  │                  │ StrategyAgenticID.sol│
│ contracts/Demo   │                  │                      │
│ YieldAdapter.sol │                  │ recordDecision():    │
└──────────────────┘                  │   storageRef         │
                                      │   + decisionHash     │
                                      │   stored per tokenId │
                                      │   (survives transfer)│
                                      └─────────────────────┘
```

---

## 0G Primitive Map

| Primitive | Role in Oasis | Implementation |
|---|---|---|
| **0G Chain** | Vault contracts, executor, agentic ID on-chain | `contracts/MasterVault.sol`, `NativeVault.sol`, `RebalanceExecutor.sol`, `StrategyAgenticID.sol` |
| **0G Compute** | AI rebalancing decision engine | `relayer/src/compute.ts` → `https://router-api.0g.ai/v1` |
| **0G Storage** | Logs decision records (inputs + output + attestation) | `relayer/src/storage.ts` → `@0gfoundation/0g-storage-ts-sdk`, indexer `indexer-storage-turbo.0g.ai` |
| **0G Agentic ID** | Tokenizes the AI strategy as ERC-721 | `contracts/StrategyAgenticID.sol` |
| **0G Pay** | Vault withdrawal fee | Fees taken in native 0G tokens. 0G Pay (pc.0g.ai) is a fiat-credit compute service with no smart-contract vault integration — documented honestly, not overclaimed. |

---

## Security Properties

| Property | Implementation |
|---|---|
| Reentrancy protection | `ReentrancyGuard` on all deposit/withdraw/rebalance functions |
| Safe token transfers | `SafeERC20` for all ERC-20 operations |
| Role-based access | `AccessControl`: `EXECUTOR_ROLE`, `RELAYER_ROLE`, `RECORDER_ROLE`, `PAUSER_ROLE` |
| Pause mechanism | `Pausable` on vaults and executor |
| Rebalance failure path | `refundOrHoldOnFailure()` — funds stay in vault on timeout, no blocking |
| Attestation requirement | `executeRebalance()` reverts if `computeAttestation.length == 0` |

---

## Honest Limitations

- **DemoYieldAdapter**: No real yield protocol exists on 0G Chain at launch. The adapter is a clearly-labeled placeholder. No APY is guaranteed or implied.
- **MockUSDC**: No native USDC on 0G Chain at launch. MasterVault uses a test stablecoin. README states this plainly.
- **Attestation depth**: The `x-worker-signature` from the 0G Compute Router is stored on-chain as the attestation bytes. Full TEE proof verification (beyond signature presence) requires the 0G Compute Direct SDK — feasible with the `@0gfoundation/0g-compute-ts-sdk` once a Direct provider is configured.
