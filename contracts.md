# Oasis Protocol — Deployed Smart Contracts

> Deployed Network: **0G Chain Aristotle Mainnet (Chain ID: 16661)**  
> RPC Endpoint: `https://evmrpc.0g.ai`  
> Block Explorer: `https://chainscan.0g.ai`  
> Deployer Account: [`0xb5aDc622a510f66E467e603377d62da5667c1f20`](https://chainscan.0g.ai/address/0xb5aDc622a510f66E467e603377d62da5667c1f20)  
> Deployment Timestamp: `2026-08-23T07:43:21.010Z`

---

## Active Mainnet Smart Contracts

| Contract Name | Deployed Address | Function & Description | Explorer Link |
|---|---|---|---|
| **NativeVault** | `0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3` | Active native 0G vault accepting deposits & minting `ov0G` shares | [View on Explorer](https://chainscan.0g.ai/address/0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3) |
| **RebalanceExecutor** | `0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d` | Verifiable AI execution orchestrator via 0G Compute + 0G Storage | [View on Explorer](https://chainscan.0g.ai/address/0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d) |
| **DemoYieldAdapter** | `0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E` | Initial mainnet strategy allocation destination (`⚠ DEMO` placeholder) | [View on Explorer](https://chainscan.0g.ai/address/0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E) |
| **StrategyAgenticID** | `0x78A8ba224b0972aa842438B184fc99BB6afd7950` | ERC-721 strategy NFT tokenizing AI identity & on-chain decision history | [View on Explorer](https://chainscan.0g.ai/address/0x78A8ba224b0972aa842438B184fc99BB6afd7950) |

---

## Confirmed On-Chain Mainnet Transactions

Below is the verified record of live transactions executed against the active 0G Aristotle mainnet contracts:

| Action / Operation | Target Contract | Block Number | Transaction Hash | Explorer Link |
|---|---|---|---|---|
| **Native 0G Deposit** | NativeVault | `#42403153` | `0x70d7aaa52e2a4a11cadffec22cbc0e89eee79857dd497888884db3adb29511b9` | [View Tx](https://chainscan.0g.ai/tx/0x70d7aaa52e2a4a11cadffec22cbc0e89eee79857dd497888884db3adb29511b9) |
| **Request Rebalance** | RebalanceExecutor | `#42403164` | `0x473aec11fcc55ff01734a4628b9656dc6efb46c669f732f8ca3ab24db079ece7` | [View Tx](https://chainscan.0g.ai/tx/0x473aec11fcc55ff01734a4628b9656dc6efb46c669f732f8ca3ab24db079ece7) |
| **Execute AI Rebalance** | RebalanceExecutor | `#42403175` | `0x66dbcf103a410bacf0384f05484fb0f1d36164a308e9b071d9b7943696afa61c` | [View Tx](https://chainscan.0g.ai/tx/0x66dbcf103a410bacf0384f05484fb0f1d36164a308e9b071d9b7943696afa61c) |
| **Record Decision** | StrategyAgenticID | `#42403184` | `0xcabd6f6172cf8b1f5e0b4b24ac04902392f872d7b60f7c897363d1b86dcdb057` | [View Tx](https://chainscan.0g.ai/tx/0xcabd6f6172cf8b1f5e0b4b24ac04902392f872d7b60f7c897363d1b86dcdb057) |
| **Mint Strategy Token #1** | StrategyAgenticID | `#42403194` | `0x45697fa5eb080b98182a5321e7d6a331f3063639775c8a0387bc548dafbbb4ee` | [View Tx](https://chainscan.0g.ai/tx/0x45697fa5eb080b98182a5321e7d6a331f3063639775c8a0387bc548dafbbb4ee) |

---

## Reserved Reference Implementations

The following contracts exist in the codebase (`contracts/`) as fully tested reference implementations reserved for future deployment:

- **`MasterVault.sol`**: ERC-4626 stablecoin vault implementation reserved for launch when established third-party stablecoins deploy on 0G Aristotle mainnet.
- **`MockUSDC.sol`**: Test stablecoin contract used for local unit testing (`npx hardhat test`).

---

## 0G System Infrastructure Endpoints

| Service Primitive | Mainnet Endpoint / URL |
|---|---|
| **0G Chain EVM RPC** | `https://evmrpc.0g.ai` |
| **0G Chain Explorer** | `https://chainscan.0g.ai` |
| **0G Compute Router** | `https://router-api.0g.ai/v1` |
| **0G Storage Indexer** | `https://indexer-storage-turbo.0g.ai` |
| **0G Storage Explorer** | `https://storagescan.0g.ai` |
