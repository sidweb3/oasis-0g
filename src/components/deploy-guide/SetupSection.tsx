import { Step, CodeBlock } from "./DeployShared";
import { AlertTriangle, ShieldAlert } from "lucide-react";

export function SetupSection() {
  return (
    <div className="space-y-6">
      {/* Security Warning Banner */}
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-red-400">
          <ShieldAlert className="h-4 w-4" />
          Critical Security: Wallet & Private Key Safety
        </div>
        <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
          <li>Always create a <strong>fresh wallet</strong> specifically for deployment — never reuse a wallet whose private key was ever exposed or committed to git.</li>
          <li>If a private key was ever committed to a git repo (even briefly), consider it <strong>permanently compromised</strong>. Transfer all funds immediately and generate a new wallet.</li>
          <li>Add <code className="bg-red-900/30 px-1 rounded">.env</code> to <code className="bg-red-900/30 px-1 rounded">.gitignore</code> <strong>before</strong> creating the file.</li>
          <li>Never share your private key with anyone or paste it into any website.</li>
        </ul>
      </div>

      <Step number={1} title="Prerequisites">
        <p>Make sure you have the following installed:</p>
        <CodeBlock language="bash" code={`node --version   # v18+ required
npm --version    # v8+ required
git --version`} />
      </Step>

      <Step number={2} title="Create a new Hardhat project">
        <CodeBlock language="bash" code={`mkdir agglayer-deploy && cd agglayer-deploy
npm init -y
npm install --save-dev hardhat
npx hardhat init`} />
        <p>When prompted, select <strong>"Create a TypeScript project"</strong> and accept all defaults.</p>
      </Step>

      <Step number={3} title="Install dependencies">
        <CodeBlock language="bash" code={`npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
npm install dotenv`} />
      </Step>

      <Step number={4} title="Add .env to .gitignore FIRST">
        <p className="text-red-400 flex items-center gap-1 font-semibold"><AlertTriangle className="h-3.5 w-3.5" /> Do this before creating your .env file!</p>
        <CodeBlock language="bash" code={`# Add .env to .gitignore before creating it
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Verify it's listed
cat .gitignore`} />
      </Step>

      <Step number={5} title="Configure hardhat.config.ts">
        <p>Replace the contents of <code className="bg-muted px-1 rounded text-xs">hardhat.config.ts</code> with:</p>
        <CodeBlock language="typescript" code={`import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
    },
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
};

export default config;`} />
        <p className="text-blue-400 text-xs mt-2">Note: In Hardhat 3, always use <code className="bg-muted px-1 rounded">import hre from "hardhat"</code> in scripts and access ethers via <code className="bg-muted px-1 rounded">hre.ethers</code> instead of importing ethers directly from "hardhat".</p>
      </Step>

      <Step number={6} title="Create .env file (after .gitignore is set)">
        <p className="text-yellow-400 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Use a brand new wallet — never one that was previously exposed!</p>
        <CodeBlock language="bash" code={`# .env  ← this file must NEVER be committed to git
PRIVATE_KEY=your_NEW_wallet_private_key_here
POLYGON_RPC_URL=https://polygon-rpc.com
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGONSCAN_API_KEY=your_polygonscan_api_key`} />
        <p>To generate a new wallet safely, use MetaMask (create a new account) or run:</p>
        <CodeBlock language="bash" code={`node -e "const {ethers} = require('ethers'); const w = ethers.Wallet.createRandom(); console.log('Address:', w.address); console.log('Private Key:', w.privateKey);"`} />
        <p className="text-yellow-400 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Copy the private key only into your local .env file. Never paste it anywhere else.</p>
      </Step>
    </div>
  );
}