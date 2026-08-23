import "dotenv/config";
import { ethers } from "ethers";
import { submitComputeJob } from "../relayer/src/compute.js";

async function runDeployTimeAdapterInferenceTest() {
  console.log("=================================================");
  console.log("0G COMPUTE DEPLOY-TIME ADAPTER INFERENCE TEST");
  console.log("Only real deployed adapters available at deploy time");
  console.log("=================================================");

  // Real checksummed EVM address for DemoYieldAdapter from deployed-contracts.json
  const realDeployedDemoAdapterAddr = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

  console.log(`Verifying DemoYieldAdapter Address: ${realDeployedDemoAdapterAddr}`);
  console.log(`ethers.isAddress() validation: ${ethers.isAddress(realDeployedDemoAdapterAddr)}`);

  const marketData = {
    vaultTVL: "500,000 USDC",
    recentVolatility: 0.12,
    requestId: 401,
    timestamp: new Date().toISOString(),
    availableAdapters: [
      {
        name: "DemoYieldAdapter (placeholder — no real yield)",
        address: realDeployedDemoAdapterAddr,
        estimatedAPY: "illustrative only — demo adapter",
        totalDeposited: "0 USDC"
      }
    ]
  };

  console.log("\nMarket Data Payload sent to 0G Compute:");
  console.log(JSON.stringify(marketData, null, 2));

  try {
    const decision = await submitComputeJob(marketData);
    console.log("\n--- 0G COMPUTE DECISION RESPONSE ---");
    console.log(JSON.stringify(decision, null, 2));

    console.log("\n--- VALIDATION ASSERTIONS ---");
    console.log(`Chosen Target Adapter:          ${decision.targetAdapter}`);
    console.log(`Chosen Target Address:          ${decision.targetAdapterAddress}`);
    console.log(`ethers.isAddress() Valid:       ${ethers.isAddress(decision.targetAdapterAddress)}`);
    console.log(`Matches Deployed Contract:      ${decision.targetAdapterAddress.toLowerCase() === realDeployedDemoAdapterAddr.toLowerCase()}`);
    console.log(`TEE Attestation Header Present: ${Boolean(decision.attestation)}`);
  } catch (err) {
    console.log(`\nInference Result: ${err.message}`);
    if (err.message.includes("OG_COMPUTE_API_KEY not set") || err.message.includes("401")) {
      console.log("\nNotice: Mandatory authentication header active on https://router-api.0g.ai/v1. Set OG_COMPUTE_API_KEY in .env.");
    }
  }
}

runDeployTimeAdapterInferenceTest();
