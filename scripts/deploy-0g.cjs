/**
 * Oasis Protocol — 0G Chain Deployment Script
 * Network: Aristotle Mainnet (chainId 16661, https://evmrpc.0g.ai)
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
 *   - Deploys all Oasis contracts in dependency order
 *   - Wires up roles (EXECUTOR_ROLE, RELAYER_ROLE, RECORDER_ROLE)
 *   - Saves all addresses to deployed-contracts.json
 *   - Auto-patches src/lib/contracts.ts with mainnet addresses
 *   - Appends deployed address block to README.md
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const EXPLORER_BASE = "https://chainscan.0g.ai/address/";

async function main() {
  // ── Pre-deploy: require tests to have been run ────────────────────────────
  // Tests are run externally before this script. Add --bail to CI pipeline.
  // To run: npx hardhat test && npx hardhat run scripts/deploy-0g.cjs --network aristotle

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║         Oasis Protocol — 0G Chain Deployment          ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");
  console.log("Deployer:       ", deployer.address);
  console.log("Balance:        ", ethers.formatEther(balance), "0G");

  if (balance < ethers.parseEther("0.05")) {
    throw new Error("Deployer balance too low — fund with at least 0.05 0G before deploying");
  }

  const deployedAt = new Date().toISOString();
  const results = { deployedAt, network: "aristotle (16661)", deployer: deployer.address };

  // ── 1. MockUSDC (used as vault asset; note in README if no real USDC exists) ──
  console.log("\n[1/6] Deploying MockUSDC (demo stablecoin — no native USDC on 0G yet)…");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUsdc = await MockUSDC.deploy();
  await mockUsdc.waitForDeployment();
  const mockUsdcAddr = await mockUsdc.getAddress();
  console.log("      MockUSDC:         ", mockUsdcAddr);
  results.MOCK_USDC = { address: mockUsdcAddr, explorer: EXPLORER_BASE + mockUsdcAddr };

  // ── 2. MasterVault (USDC vault) ──────────────────────────────────────────
  console.log("\n[2/6] Deploying MasterVault…");
  const MasterVault = await ethers.getContractFactory("MasterVault");
  const masterVault = await MasterVault.deploy(
    mockUsdcAddr,           // asset (MockUSDC — update to real USDC when available)
    "Oasis USDC Vault",     // share token name
    "ovUSDC",               // share token symbol
    deployer.address,       // feeRecipient (update to multisig in production)
    deployer.address        // admin
  );
  await masterVault.waitForDeployment();
  const masterVaultAddr = await masterVault.getAddress();
  console.log("      MasterVault:      ", masterVaultAddr);
  results.MASTER_VAULT = { address: masterVaultAddr, explorer: EXPLORER_BASE + masterVaultAddr };

  // ── 3. NativeVault (native 0G vault) ─────────────────────────────────────
  console.log("\n[3/6] Deploying NativeVault…");
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

  // ── 4. RebalanceExecutor ──────────────────────────────────────────────────
  console.log("\n[4/6] Deploying RebalanceExecutor…");
  const RebalanceExecutor = await ethers.getContractFactory("RebalanceExecutor");
  const rebalanceExecutor = await RebalanceExecutor.deploy(
    masterVaultAddr,
    nativeVaultAddr,
    deployer.address
  );
  await rebalanceExecutor.waitForDeployment();
  const rebalanceExecutorAddr = await rebalanceExecutor.getAddress();
  console.log("      RebalanceExecutor:", rebalanceExecutorAddr);
  results.REBALANCE_EXECUTOR = { address: rebalanceExecutorAddr, explorer: EXPLORER_BASE + rebalanceExecutorAddr };

  // ── 5. DemoYieldAdapter ───────────────────────────────────────────────────
  console.log("\n[5/6] Deploying DemoYieldAdapter (demo placeholder — no real yield)…");
  const DemoYieldAdapter = await ethers.getContractFactory("DemoYieldAdapter");
  const demoAdapter = await DemoYieldAdapter.deploy(mockUsdcAddr, deployer.address);
  await demoAdapter.waitForDeployment();
  const demoAdapterAddr = await demoAdapter.getAddress();
  console.log("      DemoYieldAdapter: ", demoAdapterAddr);
  results.DEMO_YIELD_ADAPTER = { address: demoAdapterAddr, explorer: EXPLORER_BASE + demoAdapterAddr };

  // ── 6. StrategyAgenticID ──────────────────────────────────────────────────
  console.log("\n[6/6] Deploying StrategyAgenticID (0G Agentic ID)…");
  const StrategyAgenticID = await ethers.getContractFactory("StrategyAgenticID");
  const agenticId = await StrategyAgenticID.deploy(deployer.address);
  await agenticId.waitForDeployment();
  const agenticIdAddr = await agenticId.getAddress();
  console.log("      StrategyAgenticID:", agenticIdAddr);
  results.STRATEGY_AGENTIC_ID = { address: agenticIdAddr, explorer: EXPLORER_BASE + agenticIdAddr };

  // ── Wire up roles ─────────────────────────────────────────────────────────
  console.log("\n── Granting roles…");

  const EXECUTOR_ROLE  = ethers.keccak256(ethers.toUtf8Bytes("EXECUTOR_ROLE"));
  const RELAYER_ROLE   = ethers.keccak256(ethers.toUtf8Bytes("RELAYER_ROLE"));
  const RECORDER_ROLE  = ethers.keccak256(ethers.toUtf8Bytes("RECORDER_ROLE"));

  // MasterVault: grant EXECUTOR_ROLE to RebalanceExecutor
  let tx = await masterVault.grantRole(EXECUTOR_ROLE, rebalanceExecutorAddr);
  await tx.wait();
  console.log("   MasterVault.EXECUTOR_ROLE → RebalanceExecutor ✓");

  // RebalanceExecutor: grant RELAYER_ROLE to deployer (update to relayer wallet in production)
  tx = await rebalanceExecutor.grantRole(RELAYER_ROLE, deployer.address);
  await tx.wait();
  console.log("   RebalanceExecutor.RELAYER_ROLE → deployer (update to relayer wallet) ✓");

  // StrategyAgenticID: grant RECORDER_ROLE to RebalanceExecutor
  tx = await agenticId.grantRole(RECORDER_ROLE, rebalanceExecutorAddr);
  await tx.wait();
  console.log("   StrategyAgenticID.RECORDER_ROLE → RebalanceExecutor ✓");

  // MasterVault: authorize DemoYieldAdapter as a strategy
  tx = await masterVault.setStrategyAdapter(demoAdapterAddr, 10000); // 100% to demo adapter initially
  await tx.wait();
  console.log("   MasterVault.setStrategyAdapter → DemoYieldAdapter (10000 bps = 100%) ✓");

  // Mint first strategy Agentic ID token (metadata storageRef to be updated post-deploy)
  tx = await agenticId.mintStrategy(
    deployer.address,
    "PENDING_UPLOAD",  // Replace with real 0G Storage hash after first upload
    "Oasis Strategy v1"
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
  console.log("MockUSDC:           ", mockUsdcAddr);
  console.log("MasterVault:        ", masterVaultAddr);
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
  MASTER_VAULT: {
    address: "${results.MASTER_VAULT.address}",
    chainId: 16661,
    explorer: "${results.MASTER_VAULT.explorer}",
  },
  NATIVE_VAULT: {
    address: "${results.NATIVE_VAULT.address}",
    chainId: 16661,
    explorer: "${results.NATIVE_VAULT.explorer}",
  },
  MOCK_USDC: {
    address: "${results.MOCK_USDC.address}",
    chainId: 16661,
    explorer: "${results.MOCK_USDC.explorer}",
    note: "Demo stablecoin — no native USDC on 0G at launch. Replace when available.",
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

  // Replace the MAINNET_CONTRACTS block if it exists, otherwise append
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
| MockUSDC (demo) | \`${results.MOCK_USDC.address}\` | [view](${results.MOCK_USDC.explorer}) |
| MasterVault | \`${results.MASTER_VAULT.address}\` | [view](${results.MASTER_VAULT.explorer}) |
| NativeVault | \`${results.NATIVE_VAULT.address}\` | [view](${results.NATIVE_VAULT.explorer}) |
| RebalanceExecutor | \`${results.REBALANCE_EXECUTOR.address}\` | [view](${results.REBALANCE_EXECUTOR.explorer}) |
| DemoYieldAdapter | \`${results.DEMO_YIELD_ADAPTER.address}\` | [view](${results.DEMO_YIELD_ADAPTER.explorer}) |
| StrategyAgenticID | \`${results.STRATEGY_AGENTIC_ID.address}\` | [view](${results.STRATEGY_AGENTIC_ID.explorer}) |

> **Note on MockUSDC**: No native USDC exists on 0G Chain at launch. MasterVault uses a test stablecoin for demo purposes. This is stated plainly.  
> **Note on DemoYieldAdapter**: Not a real yield-generating protocol integration — it is a placeholder. Docs, UI, and contract code all label this explicitly.
`;

  // Remove old deployed block if present, then append fresh
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
