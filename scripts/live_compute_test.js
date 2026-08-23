import "dotenv/config";
import { submitComputeJob } from "../relayer/src/compute.js";

async function runLiveComputeAudit() {
  console.log("=================================================");
  console.log("1. RAW CURL/FETCH TEST AGAINST https://router-api.0g.ai/v1");
  console.log("=================================================");
  
  const apiKey = process.env.OG_COMPUTE_API_KEY || "your_0g_compute_api_key_here";
  const endpoint = process.env.OG_COMPUTE_ENDPOINT || "https://router-api.0g.ai/v1";
  
  console.log(`Endpoint: ${endpoint}`);
  console.log(`API Key: ${apiKey ? (apiKey.slice(0, 8) + "...") : "MISSING"}`);
  
  try {
    const rawRes = await fetch(`${endpoint}/models`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

    console.log(`\n--- RAW HTTP RESPONSE METADATA ---`);
    console.log(`HTTP Status: ${rawRes.status} ${rawRes.statusText}`);
    console.log(`--- RAW RESPONSE HEADERS ---`);
    for (const [key, val] of rawRes.headers.entries()) {
      console.log(`${key}: ${val}`);
    }

    const rawText = await rawRes.text();
    console.log(`\n--- RAW RESPONSE BODY ---`);
    console.log(rawText.slice(0, 1000));
  } catch (err) {
    console.error("Direct fetch error:", err);
  }

  console.log("\n=================================================");
  console.log("2. 3 INFERENCE REQUESTS THROUGH PRODUCTION submitComputeJob()");
  console.log("=================================================");

  const prompts = [
    {
      vaultTVL: "1,000,000 USDC",
      availableAdapters: [
        { name: "DemoYieldAdapter", address: "0x1111111111111111111111111111111111111111", estimatedAPY: "5.2%", totalDeposited: "500,000 USDC" },
        { name: "AaveV3Adapter", address: "0x2222222222222222222222222222222222222222", estimatedAPY: "8.5%", totalDeposited: "300,000 USDC" }
      ],
      recentVolatility: 0.05,
      requestId: 101,
      timestamp: new Date().toISOString()
    },
    {
      vaultTVL: "5,000,000 USDC",
      availableAdapters: [
        { name: "UniswapV3LPAdapter", address: "0x3333333333333333333333333333333333333333", estimatedAPY: "14.2%", totalDeposited: "2,000,000 USDC" },
        { name: "CurveConvexAdapter", address: "0x4444444444444444444444444444444444444444", estimatedAPY: "11.1%", totalDeposited: "1,500,000 USDC" }
      ],
      recentVolatility: 0.35,
      requestId: 102,
      timestamp: new Date().toISOString()
    },
    {
      vaultTVL: "250,000 USDC",
      availableAdapters: [
        { name: "CompoundV3Adapter", address: "0x5555555555555555555555555555555555555555", estimatedAPY: "6.8%", totalDeposited: "100,000 USDC" }
      ],
      recentVolatility: 0.18,
      requestId: 103,
      timestamp: new Date().toISOString()
    }
  ];

  for (let i = 0; i < prompts.length; i++) {
    console.log(`\n>>> RUNNING INFERENCE REQUEST ${i + 1} (Request ID #${prompts[i].requestId}) <<<`);
    try {
      const decision = await submitComputeJob(prompts[i]);
      console.log(`Full decision object output:`);
      console.log(JSON.stringify(decision, null, 2));
    } catch (err) {
      console.error(`Inference ${i + 1} Error:`, err.message);
    }
  }
}

runLiveComputeAudit();
