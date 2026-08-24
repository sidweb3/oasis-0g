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
| **DemoYieldAdapter** | `0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E` | Initial mainnet strategy allocation destination | [View on Explorer](https://chainscan.0g.ai/address/0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E) |
| **StrategyAgenticID** | `0x78A8ba224b0972aa842438B184fc99BB6afd7950` | ERC-721 strategy NFT tokenizing AI identity & on-chain decision history | [View on Explorer](https://chainscan.0g.ai/address/0x78A8ba224b0972aa842438B184fc99BB6afd7950) |

---

## Confirmed On-Chain Mainnet Transactions

Below is the verified record of live transactions executed against the active 0G Aristotle mainnet contracts:

| Action / Operation | Target Contract | Block Number | Transaction Hash | Explorer Link |
|---|---|---|---|---|
| **Native 0G Deposit** | NativeVault | `#42450830` | `0x20ae5b5743341ccdfbd3dc5a9d293ac9669fb8d250ee079743ad234977b57b97` | [View Tx](https://chainscan.0g.ai/tx/0x20ae5b5743341ccdfbd3dc5a9d293ac9669fb8d250ee079743ad234977b57b97) |
| **Request Rebalance** | RebalanceExecutor | `#42450855` | `0x89cda16675d2962155788dbf0ccb6612a734c72a7c005867dba88b0c6c45e80b` | [View Tx](https://chainscan.0g.ai/tx/0x89cda16675d2962155788dbf0ccb6612a734c72a7c005867dba88b0c6c45e80b) |
| **Execute AI Rebalance** | RebalanceExecutor | `#42450873` | `0xae87882ed0cc5b3b8d322c87e1b9bae96c228ae725f580090862c16de411e63b` | [View Tx](https://chainscan.0g.ai/tx/0xae87882ed0cc5b3b8d322c87e1b9bae96c228ae725f580090862c16de411e63b) |
| **Record Decision** | StrategyAgenticID | `#42450892` | `0x6c2e4aa282c365154562d3b835a82e8f0ea5d0e70ccb887c7ed0e750da48c94f` | [View Tx](https://chainscan.0g.ai/tx/0x6c2e4aa282c365154562d3b835a82e8f0ea5d0e70ccb887c7ed0e750da48c94f) |
| **Mint Strategy Token #1** | StrategyAgenticID | `#42450908` | `0x1837a922ee237200a0e4f341b999c69e401bc60f0fc6d8dc696c3389691ae987` | [View Tx](https://chainscan.0g.ai/tx/0x1837a922ee237200a0e4f341b999c69e401bc60f0fc6d8dc696c3389691ae987) |

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
