# Oasis Protocol — Architecture

> Verifiable AI yield optimization on 0G Chain.  
> Rebalancing decisions are made by AI running on 0G Compute, not a static model or off-chain mock.

---

## Data Flow Diagram

## System Component Diagram

```
User deposits native 0G
         │
         ▼
┌─────────────────────┐
│    NativeVault      │  native 0G deposits
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
```

> **Allocation Scope**: At launch on 0G Aristotle mainnet, `RebalanceExecutor` operates as an AI-driven **single-adapter allocation decision engine** for `NativeVault`. Multi-adapter dynamic portfolio rebalancing will activate automatically when third-party yield protocol adapters launch on 0G Chain.

> **Roadmap Note**: USDC/stablecoin vault support is planned once a real, established stablecoin is available on 0G Aristotle mainnet — not launched at this stage to avoid using a self-minted mock token as if it held real value. `MasterVault.sol` and `MockUSDC.sol` are preserved as tested reference implementations.
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

## Architecture & Operational Characteristics

- **Native 0G Focus**: Oasis operates natively on 0G Chain gas token deposits (`0G`) via `NativeVault`, eliminating external stablecoin dependencies.
- **DemoYieldAdapter**: Serves as the active strategy allocation target on 0G Aristotle mainnet, receiving rebalanced capital allocations from `RebalanceExecutor`.
- **Attestation & Verification**: The `x-worker-signature` from the 0G Compute Router is recorded on-chain in `RebalanceExecutor` during `executeRebalance()`.

---

## Strategy Roadmap: 0G Native Staking Integration (`StakingAdapter.sol`)

### Overview & Integration Design
Real native 0G staking exists on 0G Chain Aristotle mainnet via 0G Validator Contracts. To transition from `DemoYieldAdapter` to real protocol yield without redeploying any live smart contracts, a dedicated `StakingAdapter.sol` will wrap the official `IValidatorContract` interface and be registered with the existing `RebalanceExecutor` (`0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d`).

```
+-------------------+       +--------------------+       +------------------------------+
|   NativeVault     | ----> | RebalanceExecutor  | ----> |      StakingAdapter.sol      |
|  (0xBe08...5FF3)  |       |  (0x36F7...b35d)   |       |  (NEW: Native 0G Staking)    |
+-------------------+       +--------------------+       +--------------+---------------+
                                                                        |
                                                                        v
                                                            0G IValidatorContract
                                                            (Validator Address)
```

### Official 0G Staking Interface (`IValidatorContract`)
According to 0G Chain system architecture, validator delegations interact directly with the validator's smart contract via `IValidatorContract`:

```solidity
interface IValidatorContract {
    function delegate() external payable;
    function undelegate(uint256 amount) external;
    function withdrawRewards() external returns (uint256 rewards);
    function getDelegation(address delegator) external view returns (uint256 shares, uint256 balance);
}
```

> **Architecture Note**: Precompile `0x0000000000000000000000000000000000001000` on 0G Chain is assigned to `DASigners` (Data Availability System Signers), and `0x0000000000000000000000000000000000001001` to `WrappedOGBase`. Native staking/delegation is routed through `IValidatorContract(targetValidatorAddress).delegate{value: amount}()`.

### `StakingAdapter.sol` Implementation Outline
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IStrategyAdapter.sol";

interface IValidatorContract {
    function delegate() external payable;
    function undelegate(uint256 amount) external;
    function withdrawRewards() external returns (uint256 rewards);
    function getDelegation(address delegator) external view returns (uint256 shares, uint256 balance);
}

contract StakingAdapter is IStrategyAdapter {
    address public targetValidatorContract;
    address public vault;

    constructor(address _vault, address _targetValidatorContract) {
        vault = _vault;
        targetValidatorContract = _targetValidatorContract;
    }

    function deposit(uint256 amount) external payable override returns (uint256) {
        require(msg.sender == vault, "Only vault");
        IValidatorContract(targetValidatorContract).delegate{value: amount}();
        return amount;
    }

    function withdraw(uint256 amount) external override returns (uint256) {
        require(msg.sender == vault, "Only vault");
        IValidatorContract(targetValidatorContract).undelegate(amount);
        return amount;
    }

    function getTVL() external view override returns (uint256) {
        (, uint256 balance) = IValidatorContract(targetValidatorContract).getDelegation(address(this));
        return balance + address(this).balance;
    }
}
```

### Deployment & Security Protocol
1. **Zero Downtime / Zero Redeployment**: `NativeVault` and `RebalanceExecutor` remain 100% untouched.
2. **Adapter Authorization**: Deploy `StakingAdapter.sol` with target 0G mainnet validator contract address, then call `RebalanceExecutor.grantRole(STRATEGY_ROLE, stakingAdapterAddress)`.
3. **Hardhat Test Verification**: `StakingAdapter.sol` will be unit tested locally against a mock `IValidatorContract` prior to any mainnet transaction.

