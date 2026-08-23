import { Step, CodeBlock } from "./DeployShared";
import { ExternalLink } from "lucide-react";

export function VerifySection() {
  return (
    <div className="space-y-6">
      <Step number={1} title="Get a PolygonScan API key">
        <p>Go to <a href="https://polygonscan.com/myapikey" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">polygonscan.com/myapikey <ExternalLink className="h-3 w-3" /></a>, create a free account, and generate an API key.</p>
        <p>Add it to your <code className="bg-muted px-1 rounded text-xs">.env</code> file as <code className="bg-muted px-1 rounded text-xs">POLYGONSCAN_API_KEY</code>.</p>
      </Step>

      <Step number={2} title="Verify contracts with Hardhat">
        <p>Run the verify command for each deployed contract:</p>
        <CodeBlock language="bash" code={`# Verify MasterVault
npx hardhat verify --network polygon <MASTER_VAULT_ADDRESS> \\
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" \\
  "<YOUR_DEPLOYER_ADDRESS>"

# Verify POLVault (no constructor args)
npx hardhat verify --network polygon <POL_VAULT_ADDRESS>

# Verify RebalanceExecutor
npx hardhat verify --network polygon <REBALANCE_EXECUTOR_ADDRESS> \\
  "<MASTER_VAULT_ADDRESS>"`} />
      </Step>

      <Step number={3} title="Confirm on PolygonScan">
        <p>Visit <a href="https://polygonscan.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">polygonscan.com <ExternalLink className="h-3 w-3" /></a> and search for your contract addresses. You should see a green checkmark ✅ on the Contract tab indicating successful verification.</p>
      </Step>
    </div>
  );
}
