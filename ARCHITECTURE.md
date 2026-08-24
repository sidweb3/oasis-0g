# Oasis Protocol — System Architecture & Technical Specification

> **0G Chain Aristotle Mainnet Deployment** | Chain ID: `16661` | RPC: `https://evmrpc.0g.ai` | Explorer: [chainscan.0g.ai](https://chainscan.0g.ai)

Oasis is the **verifiable AI portfolio management and yield optimization protocol** built natively for 0G Chain. It bridges high-performance off-chain AI reasoning with strict on-chain execution by leveraging:
- **0G Compute**: TEE-attested AI model inference (`llama-3.3-70b-instruct`).
- **0G Storage**: Immutable, audit-ready storage of full AI decision rationale and risk matrices.
- **0G Chain**: Smart contract execution layer enforcing cryptographic attestations before any capital movement.
- **Strategy Agentic ID (ERC-7857)**: Ownable, tokenized AI strategy identities with permanent on-chain track records.

---

## 📊 High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                              USER INTERFACE (Wagmi / Web3)                         |
+-----------------------------------------+-----------------------------------------+
                                          | Deposits 0G
                                          v
+-----------------------------------------------------------------------------------+
|                                 0G CHAIN MAINNET                                  |
|                                                                                   |
|   +-----------------------+                    +------------------------------+   |
|   |      NativeVault      |                    |    StrategyAgenticID (ERC-721) |   |
|   | (0xBe08...5FF3)       |                    |    (0x78A8...7950)            |   |
|   +-----------+-----------+                    +--------------^---------------+   |
|               | Authorizes                                    | Records           |
|               v                                               | Decision History  |
|   +-----------+-----------+                    +--------------+---------------+   |
|   |   RebalanceExecutor   | -----------------> |       DemoYieldAdapter       |   |
|   | (0x36F7...b35d)       |  Executes Capital  |       (0xB71a...7F1E)        |   |
|   +-----------^-----------+  Allocation        +------------------------------+   |
+---------------|-------------------------------------------------------------------+
                |
                | 1. RebalanceRequested Event
                | 4. executeRebalance() with TEE Proof & Storage Hash
                v
+-----------------------------------------------------------------------------------+
|                              OASIS RELAYER SERVICE                                |
|                                                                                   |
|  +------------------------+  2. AI Inference Request  +-------------------------+  |
|  |     0G Compute Router  | <-----------------------> |    0G Storage Network   |  |
|  |   (router-api.0g.ai)   |                           | (indexer-storage-turbo) |  |
|  |  [TEE Attestation]     | ------------------------> | [Audit Trail Hash]      |  |
|  +------------------------+  3. Decision Rationale    +-------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 🏛️ Smart Contract Infrastructure

### 1. NativeVault (`NativeVault.sol`)
- **Mainnet Address:** `0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3`
- **Explorer:** [View on 0G Explorer](https://chainscan.0g.ai/address/0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3)
- **Role:** Primary liquidity vault accepting native 0G gas token deposits.
- **Key Features:**
  - Standardized 1-transaction deposit flow (`deposit()`).
  - Mints `ov0G` receipt tokens representing fractional vault ownership.
  - Grants capital rebalancing authority to `RebalanceExecutor`.
  - Exposes `totalValueLocked()` for real-time TVL auditing.

### 2. RebalanceExecutor (`RebalanceExecutor.sol`)
- **Mainnet Address:** `0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d`
- **Explorer:** [View on 0G Explorer](https://chainscan.0g.ai/address/0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d)
- **Role:** Autonomous strategy orchestrator enforcing cryptographic proof verification.
- **Key Features:**
  - `requestRebalance(address vault, uint256 amount)`: Emits `RebalanceRequested` event to initiate off-chain AI computation.
  - `executeRebalance(...)`: Verifies `computeAttestation` bytes (TEE worker signature from 0G Compute) and `storageRef` hash before permitting strategy transfers.
  - Enforces role-based security (`EXECUTOR_ROLE`, `RELAYER_ROLE`).

### 3. StrategyAgenticID (`StrategyAgenticID.sol`)
- **Mainnet Address:** `0x78A8ba224b0972aa842438B184fc99BB6afd7950`
- **Explorer:** [View on 0G Explorer](https://chainscan.0g.ai/address/0x78A8ba224b0972aa842438B184fc99BB6afd7950)
- **Role:** Tokenized AI strategy identity implementing the ERC-7857 agentic pattern.
- **Key Features:**
  - Tokenizes AI strategy models as ownable, transferable ERC-721 assets.
  - On-chain function `recordDecision(uint256 tokenId, string storageRef, bytes32 decisionHash)` binds every execution to the token's permanent track record.
  - Strategy performance, historical decisions, and 0G Storage hashes stay attached to the token across transfers.

### 4. DemoYieldAdapter (`DemoYieldAdapter.sol`)
- **Mainnet Address:** `0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E`
- **Explorer:** [View on 0G Explorer](https://chainscan.0g.ai/address/0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E)
- **Role:** Mainnet strategy destination contract receiving rebalanced 0G capital allocations.

---

## ⚡ 0G Decentralized Infrastructure Integration

### 1. 0G Compute Integration
- **API Endpoint:** `https://router-api.0g.ai/v1`
- **Model Executed:** `llama-3.3-70b-instruct` inside TEE enclaves.
- **Verification Mechanism:** Every AI inference request returns a cryptographic worker signature (`x-worker-signature` HTTP header). This signature is passed into `executeRebalance()` as `computeAttestation` and verified on-chain.

### 2. 0G Storage Integration
- **Storage Indexer:** `https://indexer-storage-turbo.0g.ai`
- **Audit Logging:** The complete JSON payload containing market metrics, risk vectors, AI reasoning, and allocation rationale is uploaded directly to 0G Storage.
- **On-Chain Anchor:** The returned 0G Storage root hash (`storageRef`) is committed on-chain in `RebalanceExecutor` and indexed under the strategy's `StrategyAgenticID`.

---

## 🔄 End-to-End Rebalancing Lifecycle

1. **User Action:** User deposits 0G into `NativeVault` and triggers `requestRebalance()`.
2. **Event Emission:** `RebalanceExecutor` emits `RebalanceRequested(requestId, vault, amount, timestamp)`.
3. **AI Inference:** The Oasis Relayer picks up the event, gathers real-time market data, and queries **0G Compute**.
4. **TEE Attestation & Storage Upload:** 0G Compute executes model inference within a TEE enclave, returning the allocation decision and TEE worker signature. The full reasoning tree is saved to **0G Storage**.
5. **On-Chain Execution:** The Relayer calls `executeRebalance()` on `RebalanceExecutor`, supplying the decision hash, TEE signature, and 0G Storage reference hash.
6. **Track Record Logging:** `RebalanceExecutor` executes capital transfer to the strategy adapter and logs the decision permanently to `StrategyAgenticID`.

---

## 🔒 Security & Access Control Architecture

| Contract | Role / Mechanism | Functionality |
|---|---|---|
| **RebalanceExecutor** | `DEFAULT_ADMIN_ROLE` | Managed by protocol governance deployer wallet |
| **RebalanceExecutor** | `EXECUTOR_ROLE` | Authorized to trigger rebalance execution |
| **RebalanceExecutor** | `RELAYER_ROLE` | Authorized to submit TEE proofs & storage hashes |
| **StrategyAgenticID** | `RECORDER_ROLE` | Granted to `RebalanceExecutor` to record verified decisions |
| **NativeVault** | Rebalance Authorization | Restricts capital movement exclusively to `RebalanceExecutor` |
