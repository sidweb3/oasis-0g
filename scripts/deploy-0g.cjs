/**
 * Oasis Protocol — 0G Chain Deployment Script
 * Network: Aristotle Mainnet (chainId 16661, https://evmrpc.0g.ai)
 * Launch Configuration: NativeVault ONLY (native 0G token vault)
 *
 * Pre-requisites:
 *   1. Unit tests must pass: npx hardhat test
 *   2. .env must have DEPLOYER_PRIVATE_KEY set
 *   3. Deployer wallet must be funded with 0G for gas
 *
 * Usage:
 *   npx hardhat run scripts/deploy-0g.cjs --network aristotle
 *
 * This script:
 *   - Deploys NativeVault, RebalanceExecutor, DemoYieldAdapter, StrategyAgenticID
 *   - Wires up roles (RELAYER_ROLE, RECORDER_ROLE)
 *   - Saves all addresses to deployed-contracts.json
 *   - Auto-patches src/lib/contracts.ts with mainnet addresses
 *   - Appends deployed address block to README.md
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const EXPLORER_BASE = "https://chainscan.0g.ai/address/";

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║         Oasis Protocol — 0G Chain Deployment          ║");
  console.log("║               (NativeVault Launch Only)               ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");
  console.log("Deployer:       ", deployer.address);
  console.log("Balance:        ", ethers.formatEther(balance), "0G");

  if (balance < ethers.parseEther("0.05")) {
    throw new Error("Deployer balance too low — fund with at least 0.05 0G before deploying");
  }

  const deployedAt = new Date().toISOString();
  const results = { deployedAt, network: "aristotle (16661)", deployer: deployer.address };

  // ── 1. NativeVault (native 0G vault) ─────────────────────────────────────
  console.log("\n[1/4] Deploying NativeVault (Native 0G Token Vault)…");
  const NativeVault = await ethers.getContractFactory("NativeVault");
  const nativeVault = await NativeVault.deploy(
    "Oasis 0G Vault",  // share token name
    "ov0G",            // share token symbol
    deployer.address,  // feeRecipient
    deployer.address   // admin
  );
  await nativeVault.waitForDeployment();
  const nativeVaultAddr = await nativeVault.getAddress();
  console.log("      NativeVault:      ", nativeVaultAddr);
  results.NATIVE_VAULT = { address: nativeVaultAddr, explorer: EXPLORER_BASE + nativeVaultAddr };

  // ── 2. RebalanceExecutor ──────────────────────────────────────────────────
  console.log("\n[2/4] Deploying RebalanceExecutor…");
  const RebalanceExecutor = await ethers.getContractFactory("RebalanceExecutor");
  const rebalanceExecutor = await RebalanceExecutor.deploy(
    ethers.ZeroAddress, // masterVault set to address(0) for NativeVault-only launch
    nativeVaultAddr,
    deployer.address
  );
  await rebalanceExecutor.waitForDeployment();
  const rebalanceExecutorAddr = await rebalanceExecutor.getAddress();
  console.log("      RebalanceExecutor:", rebalanceExecutorAddr);
  results.REBALANCE_EXECUTOR = { address: rebalanceExecutorAddr, explorer: EXPLORER_BASE + rebalanceExecutorAddr };

  // ── 3. DemoYieldAdapter ───────────────────────────────────────────────────
  console.log("\n[3/4] Deploying DemoYieldAdapter (demo placeholder — no real yield)…");
  const DemoYieldAdapter = await ethers.getContractFactory("DemoYieldAdapter");
  const demoAdapter = await DemoYieldAdapter.deploy(ethers.ZeroAddress, deployer.address);
  await demoAdapter.waitForDeployment();
  const demoAdapterAddr = await demoAdapter.getAddress();
  console.log("      DemoYieldAdapter: ", demoAdapterAddr);
  results.DEMO_YIELD_ADAPTER = { address: demoAdapterAddr, explorer: EXPLORER_BASE + demoAdapterAddr };

  // ── 4. StrategyAgenticID ──────────────────────────────────────────────────
  console.log("\n[4/4] Deploying StrategyAgenticID (0G Agentic ID)…");
  const StrategyAgenticID = await ethers.getContractFactory("StrategyAgenticID");
  const agenticId = await StrategyAgenticID.deploy(deployer.address);
  await agenticId.waitForDeployment();
  const agenticIdAddr = await agenticId.getAddress();
  console.log("      StrategyAgenticID:", agenticIdAddr);
  results.STRATEGY_AGENTIC_ID = { address: agenticIdAddr, explorer: EXPLORER_BASE + agenticIdAddr };

  // ── Wire up roles ─────────────────────────────────────────────────────────
  console.log("\n── Granting roles…");

  const RELAYER_ROLE   = ethers.keccak256(ethers.toUtf8Bytes("RELAYER_ROLE"));
  const RECORDER_ROLE  = ethers.keccak256(ethers.toUtf8Bytes("RECORDER_ROLE"));

  // RebalanceExecutor: grant RELAYER_ROLE to deployer
  let tx = await rebalanceExecutor.grantRole(RELAYER_ROLE, deployer.address);
  await tx.wait();
  console.log("   RebalanceExecutor.RELAYER_ROLE → deployer ✓");

  // StrategyAgenticID: grant RECORDER_ROLE to RebalanceExecutor
  tx = await agenticId.grantRole(RECORDER_ROLE, rebalanceExecutorAddr);
  await tx.wait();
  console.log("   StrategyAgenticID.RECORDER_ROLE → RebalanceExecutor ✓");

  // Mint first strategy Agentic ID token
  tx = await agenticId.mintStrategy(
    deployer.address,
    "PENDING_UPLOAD",
    "Oasis 0G Strategy v1"
  );
  await tx.wait();
  console.log("   StrategyAgenticID token #0 minted to deployer ✓");

  // ── Save results ──────────────────────────────────────────────────────────
  const outputPath = path.join(__dirname, "..", "deployed-contracts.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log("\n── deployed-contracts.json written ✓");

  // Patch src/lib/contracts.ts
  patchContractsTs(results);
  console.log("── src/lib/contracts.ts patched ✓");

  // Append to README
  appendToReadme(results);
  console.log("── README.md updated ✓");

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║               DEPLOYMENT COMPLETE ✓                   ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");
  console.log("NativeVault:        ", nativeVaultAddr);
  console.log("RebalanceExecutor:  ", rebalanceExecutorAddr);
  console.log("DemoYieldAdapter:   ", demoAdapterAddr);
  console.log("StrategyAgenticID:  ", agenticIdAddr);
  console.log("");
  console.log("Explorer: https://chainscan.0g.ai");
  console.log("\n⚠  NEXT STEPS:");
  console.log("  1. Update RELAYER_ROLE: grant it to your relayer wallet, revoke from deployer");
  console.log("  2. Upload strategy config to 0G Storage and call agenticId.updateStorageRef(0, <hash>)");
  console.log("  3. Fund relayer wallet with 0G for gas");
  console.log("  4. Start the relayer: cd relayer && npm start");
}

/**
 * Patch src/lib/contracts.ts to insert the deployed mainnet addresses.
 */
function patchContractsTs(results) {
  const contractsPath = path.join(__dirname, "..", "src", "lib", "contracts.ts");
  let content = fs.readFileSync(contractsPath, "utf8");

  const newMainnet = `// 0G Aristotle Mainnet — auto-generated by deploy-0g.cjs on ${results.deployedAt}
export const MAINNET_CONTRACTS = {
  NATIVE_VAULT: {
    address: "${results.NATIVE_VAULT.address}",
    chainId: 16661,
    explorer: "${results.NATIVE_VAULT.explorer}",
  },
  REBALANCE_EXECUTOR: {
    address: "${results.REBALANCE_EXECUTOR.address}",
    chainId: 16661,
    explorer: "${results.REBALANCE_EXECUTOR.explorer}",
  },
  DEMO_YIELD_ADAPTER: {
    address: "${results.DEMO_YIELD_ADAPTER.address}",
    chainId: 16661,
    explorer: "${results.DEMO_YIELD_ADAPTER.explorer}",
  },
  STRATEGY_AGENTIC_ID: {
    address: "${results.STRATEGY_AGENTIC_ID.address}",
    chainId: 16661,
    explorer: "${results.STRATEGY_AGENTIC_ID.explorer}",
  },
} as const;`;

  if (content.includes("export const MAINNET_CONTRACTS")) {
    content = content.replace(/\/\/ [^\n]*Mainnet[^\n]*\nexport const MAINNET_CONTRACTS[\s\S]*?\} as const;/, newMainnet);
  } else {
    content = content + "\n\n" + newMainnet;
  }

  fs.writeFileSync(contractsPath, content);
}

/**
 * Append a deployment summary block to README.md.
 */
function appendToReadme(results) {
  const readmePath = path.join(__dirname, "..", "README.md");
  let readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8") : "";

  const block = `
---

## Deployed Contracts (0G Aristotle Mainnet)

> Deployed: ${results.deployedAt}  
> Network: 0G Chain Aristotle (Chain ID 16661)  
> Explorer: https://chainscan.0g.ai

| Contract | Address | Explorer |
|---|---|---|
| NativeVault | \`${results.NATIVE_VAULT.address}\` | [view](${results.NATIVE_VAULT.explorer}) |
| RebalanceExecutor | \`${results.REBALANCE_EXECUTOR.address}\` | [view](${results.REBALANCE_EXECUTOR.explorer}) |
| DemoYieldAdapter | \`${results.DEMO_YIELD_ADAPTER.address}\` | [view](${results.DEMO_YIELD_ADAPTER.explorer}) |
| StrategyAgenticID | \`${results.STRATEGY_AGENTIC_ID.address}\` | [view](${results.STRATEGY_AGENTIC_ID.explorer}) |

> **Launch Note**: OASIS is launched on 0G Aristotle mainnet with NativeVault (native 0G token) active. USDC/stablecoin vault support is planned once a real, established stablecoin is available on 0G Aristotle mainnet — not launched at this stage to avoid using a self-minted mock token as if it held real value.
`;

  const marker = "---\n\n## Deployed Contracts (0G Aristotle Mainnet)";
  if (readme.includes(marker)) {
    readme = readme.substring(0, readme.indexOf(marker));
  }
  fs.writeFileSync(readmePath, readme + block);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
