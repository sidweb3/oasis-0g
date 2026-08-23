import { Step, CodeBlock } from "./DeployShared";

export function DeploySection() {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-300">
        <strong>Deploy in this exact order:</strong> MockUSDC (or use real USDC) → MasterVault → POLVault → RebalanceExecutor
      </div>

      <Step number={1} title="Copy contracts into the project">
        <p>Copy the contract files from Section 2 into the <code className="bg-muted px-1 rounded text-xs">contracts/</code> folder:</p>
        <CodeBlock language="bash" code={`contracts/
  MockUSDC.sol
  MasterVault.sol
  POLVault.sol
  RebalanceExecutor.sol`} />
      </Step>

      <Step number={2} title="Create the deploy script">
        <p>Create <code className="bg-muted px-1 rounded text-xs">scripts/deploy.ts</code>:</p>
        <CodeBlock language="typescript" code={`import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "POL");

  // 1. Real USDC on Polygon Mainnet (no need to deploy)
  const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  console.log("\\nUsing real USDC:", USDC_ADDRESS);

  // 2. Deploy MasterVault
  console.log("\\nDeploying MasterVault...");
  const MasterVault = await hre.ethers.getContractFactory("MasterVault");
  const masterVault = await MasterVault.deploy(USDC_ADDRESS, deployer.address);
  await masterVault.waitForDeployment();
  const masterVaultAddr = await masterVault.getAddress();
  console.log("MasterVault deployed to:", masterVaultAddr);

  // 3. Deploy POLVault
  console.log("\\nDeploying POLVault...");
  const POLVault = await hre.ethers.getContractFactory("POLVault");
  const polVault = await POLVault.deploy();
  await polVault.waitForDeployment();
  const polVaultAddr = await polVault.getAddress();
  console.log("POLVault deployed to:", polVaultAddr);

  // 4. Deploy RebalanceExecutor
  console.log("\\nDeploying RebalanceExecutor...");
  const RebalanceExecutor = await hre.ethers.getContractFactory("RebalanceExecutor");
  const rebalanceExecutor = await RebalanceExecutor.deploy(masterVaultAddr);
  await rebalanceExecutor.waitForDeployment();
  const rebalanceExecutorAddr = await rebalanceExecutor.getAddress();
  console.log("RebalanceExecutor deployed to:", rebalanceExecutorAddr);

  console.log("\\n=== DEPLOYMENT COMPLETE ===");
  console.log("USDC (real):        ", USDC_ADDRESS);
  console.log("MasterVault:        ", masterVaultAddr);
  console.log("POLVault:           ", polVaultAddr);
  console.log("RebalanceExecutor:  ", rebalanceExecutorAddr);
  console.log("\\nUpdate src/lib/contracts.ts with these addresses!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`} />
      </Step>

      <Step number={3} title="Compile contracts">
        <CodeBlock language="bash" code={`npx hardhat compile`} />
        <p>You should see <strong>"Compiled X Solidity files successfully"</strong>.</p>
      </Step>

      <Step number={4} title="Deploy to Polygon Mainnet">
        <p className="text-yellow-400">⚠️ Make sure your wallet has at least 0.5 POL for gas fees.</p>
        <CodeBlock language="bash" code={`npx hardhat run scripts/deploy.ts --network polygon`} />
        <p>Save all the deployed addresses printed in the console output.</p>
      </Step>

      <Step number={5} title="Deploy to Amoy Testnet (optional)">
        <p>To test on Amoy first, get test POL from the <a href="https://faucet.polygon.technology" target="_blank" rel="noopener noreferrer" className="text-primary underline">Polygon Faucet</a>, then:</p>
        <CodeBlock language="bash" code={`npx hardhat run scripts/deploy.ts --network amoy`} />
      </Step>
    </div>
  );
}