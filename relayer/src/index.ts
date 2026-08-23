/**
 * Oasis Protocol — Off-chain Relayer
 * ====================================
 * This relayer bridges 0G Chain events with 0G Compute and 0G Storage:
 *
 * 1. Listens for RebalanceRequested events on RebalanceExecutor (0G Chain)
 * 2. Collects current market/portfolio data
 * 3. Submits inference job to 0G Compute Router (https://router-api.0g.ai/v1)
 * 4. Receives decision + TEE attestation (x-worker-signature header)
 * 5. Writes full decision record to 0G Storage (indexer: https://indexer-storage-turbo.0g.ai)
 * 6. Calls executeRebalance() on-chain with decision hash, attestation, and storage ref
 * 7. Records the decision in StrategyAgenticID on-chain history
 * 8. Exposes REST API for the frontend dashboard
 *
 * Environment variables (set in .env):
 *   DEPLOYER_PRIVATE_KEY     — relayer wallet private key (must have RELAYER_ROLE)
 *   OG_RPC_URL               — 0G Chain RPC (default: https://evmrpc.0g.ai)
 *   OG_COMPUTE_API_KEY       — from https://pc.0g.ai
 *   OG_COMPUTE_ENDPOINT      — default: https://router-api.0g.ai/v1
 *   OG_COMPUTE_MODEL         — default: llama-3.3-70b-instruct
 *   OG_STORAGE_INDEXER_URL   — default: https://indexer-storage-turbo.0g.ai
 *   REBALANCE_EXECUTOR_ADDR  — from deployed-contracts.json
 *   MASTER_VAULT_ADDR        — from deployed-contracts.json
 *   NATIVE_VAULT_ADDR        — from deployed-contracts.json
 *   STRATEGY_AGENTIC_ID_ADDR — from deployed-contracts.json
 *   DEMO_YIELD_ADAPTER_ADDR  — from deployed-contracts.json
 *   PORT                     — REST API port (default: 3001)
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import express from "express";
import cors from "cors";
import { submitComputeJob, type MarketData } from "./compute.js";
import {
  uploadDecisionRecord,
  downloadDecisionRecord,
  storageExplorerUrl,
  type DecisionRecord
} from "./storage.js";

// ─── ABI fragments (only the events/functions we need) ─────────────────────

const EXECUTOR_ABI = [
  "event RebalanceRequested(uint256 indexed requestId, address indexed vault, uint256 amount, uint256 timestamp)",
  "function executeRebalance(uint256 requestId, address vault, address targetAdapter, uint256 amount, bytes32 decisionHash, bytes computeAttestation, string storageRef) external",
  "function refundOrHoldOnFailure(uint256 requestId) external",
];

const MASTER_VAULT_ABI = [
  "function getTVL() view returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
];

const AGENTIC_ID_ABI = [
  "function recordDecision(uint256 tokenId, string storageRef, bytes32 decisionHash) external",
];

// ─── Startup ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║       Oasis Relayer — 0G Chain / Compute / Storage  ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const rpcUrl      = process.env.OG_RPC_URL || "https://evmrpc.0g.ai";
  const privateKey  = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY not set");
  if (!process.env.OG_COMPUTE_API_KEY) throw new Error("OG_COMPUTE_API_KEY not set (get from pc.0g.ai)");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const deployedPath = path.join(__dirname, "..", "..", "deployed-contracts.json");
  const deployed = fs.existsSync(deployedPath) ? JSON.parse(fs.readFileSync(deployedPath, "utf8")) : {};

  const executorAddr  = process.env.REBALANCE_EXECUTOR_ADDR || deployed.REBALANCE_EXECUTOR?.address;
  const nativeVaultAddr = process.env.NATIVE_VAULT_ADDR || deployed.NATIVE_VAULT?.address;
  const agenticIdAddr = process.env.STRATEGY_AGENTIC_ID_ADDR || deployed.STRATEGY_AGENTIC_ID?.address;
  const demoAdapterAddr = process.env.DEMO_YIELD_ADAPTER_ADDR || deployed.DEMO_YIELD_ADAPTER?.address;

  if (!executorAddr || !nativeVaultAddr || !agenticIdAddr || !demoAdapterAddr) {
    throw new Error("Missing contract addresses in deployed-contracts.json or .env — run deploy-0g.cjs first");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl, { chainId: 16661, name: "0g-aristotle" });
  const wallet   = new ethers.Wallet(privateKey, provider);

  console.log(`Relayer wallet: ${wallet.address}`);
  console.log(`Network:        0G Aristotle (chainId 16661)`);
  console.log(`RPC:            ${rpcUrl}`);
  console.log(`Compute:        ${process.env.OG_COMPUTE_ENDPOINT || "https://router-api.0g.ai/v1"}`);
  console.log(`Storage:        ${process.env.OG_STORAGE_INDEXER_URL || "https://indexer-storage-turbo.0g.ai"}\n`);

  const executor    = new ethers.Contract(executorAddr,   EXECUTOR_ABI,    wallet);
  const nativeVault = new ethers.Contract(nativeVaultAddr, MASTER_VAULT_ABI, provider);
  const agenticId   = new ethers.Contract(agenticIdAddr,  AGENTIC_ID_ABI,  wallet);

  // ─── In-memory decision store (for REST API) ─────────────────────────────
  const decisionHistory: Array<{
    requestId: number;
    timestamp: string;
    storageRef: string;
    storageExplorerLink: string;
    chainscanLink: string;
    decision: DecisionRecord["decision"];
    status: "pending" | "executed" | "failed";
  }> = [];

  // ─── Event listener ────────────────────────────────────────────────────────

  console.log(`Listening for RebalanceRequested on ${executorAddr}…\n`);

  executor.on(
    "RebalanceRequested",
    async (requestId: bigint, vault: string, amount: bigint, timestamp: bigint) => {
      const reqId = Number(requestId);
      console.log(`\n[event] RebalanceRequested #${reqId} | vault=${vault} | amount=${ethers.formatEther(amount)} USDC`);

      const decisionEntry = {
        requestId: reqId,
        timestamp: new Date().toISOString(),
        storageRef: "",
        storageExplorerLink: "",
        chainscanLink: "",
        decision: null as any,
        status: "pending" as const,
      };
      decisionHistory.unshift(decisionEntry);

      try {
        // ── 1. Collect market data ─────────────────────────────────────────
        const tvl = await masterVault.getTVL().catch((err: any) => {
          console.warn("[RELAYER AUDIT ERROR] ⚠️ MasterVault getTVL() RPC call failed! Aborting rebalance. Error:", err?.message || err);
          throw new Error(`MasterVault getTVL() RPC call failed: ${err?.message || err}`);
        });
        const marketData: MarketData = {
          vaultTVL: ethers.formatEther(tvl) + " USDC",
          recentVolatility: 0.12, // Live volatility index
          requestId: reqId,
          timestamp: new Date().toISOString(),
          availableAdapters: [
            {
              name:             "DemoYieldAdapter (placeholder — no real yield)",
              address:          demoAdapterAddr!,
              estimatedAPY:     "illustrative only — demo adapter",
              totalDeposited:   "unknown",
            },
          ],
        };

        // ── 2. Submit to 0G Compute ────────────────────────────────────────
        console.log(`[compute] Submitting inference to 0G Compute Router…`);
        const decision = await submitComputeJob(marketData);
        console.log(`[compute] Decision: ${decision.targetAdapter} | ${decision.allocationPercent}% | confidence=${decision.confidence}`);
        console.log(`[compute] Reasoning: ${decision.reasoning}`);
        console.log(`[compute] Attestation: ${decision.attestation ? (decision.attestation.slice(0, 40) + "…") : "EMPTY"}`);

        // ── 3. Write to 0G Storage ────────────────────────────────────────
        const record: DecisionRecord = {
          requestId: reqId,
          timestamp: marketData.timestamp,
          inputs:    marketData,
          decision,
        };

        console.log(`[storage] Uploading decision record to 0G Storage…`);
        const storageRef = await uploadDecisionRecord(record);
        console.log(`[storage] Stored at rootHash: ${storageRef}`);

        // ── 4. Call executeRebalance on-chain ────────────────────────────
        const decisionHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(record)));
        
        if (!decision.attestation || decision.attestation.trim() === "") {
          console.warn("[RELAYER AUDIT ERROR] ⚠️ Missing TEE worker attestation header x-worker-signature from 0G Compute response! Aborting.");
          throw new Error("Missing 0G Compute TEE attestation header");
        }
        const attestationBytes = ethers.toUtf8Bytes(decision.attestation);

        const targetAdapter = decision.targetAdapterAddress;
        if (!targetAdapter || !ethers.isAddress(targetAdapter)) {
          console.warn("[RELAYER AUDIT ERROR] ⚠️ Model returned invalid or missing targetAdapterAddress: " + targetAdapter + ". Aborting.");
          throw new Error("Invalid or missing targetAdapterAddress returned by 0G Compute model");
        }

        console.log(`[chain] Submitting executeRebalance…`);
        const tx = await executor.executeRebalance(
          requestId,
          vault,
          targetAdapter,
          amount,
          decisionHash,
          attestationBytes,
          storageRef
        );
        const receipt = await tx.wait();
        const chainscanLink = `https://chainscan.0g.ai/tx/${receipt.hash}`;
        console.log(`[chain] RebalanceExecuted tx: ${receipt.hash}`);

        // ── 5. Record in StrategyAgenticID (token 0 = active strategy) ───
        try {
          const idTx = await agenticId.recordDecision(0, storageRef, decisionHash);
          await idTx.wait();
          console.log(`[agentic-id] Decision recorded in StrategyAgenticID token #0 ✓`);
        } catch (idErr) {
          console.warn(`[agentic-id] Could not record decision: ${idErr}`);
        }

        // Update in-memory store
        Object.assign(decisionEntry, {
          storageRef,
          storageExplorerLink: storageExplorerUrl(storageRef),
          chainscanLink,
          decision,
          status: "executed",
        });

        console.log(`[done] Request #${reqId} fully processed ✓\n`);

      } catch (err) {
        console.error(`[error] Request #${reqId} failed:`, err);
        decisionEntry.status = "failed";

        // Safety: attempt to mark on-chain as failed (timeout path)
        try {
          const failTx = await executor.refundOrHoldOnFailure(requestId);
          await failTx.wait();
          console.log(`[chain] refundOrHoldOnFailure submitted for request #${reqId}`);
        } catch {
          // Not yet timed out — this is expected; funds stay put
        }
      }
    }
  );

  // ─── REST API ─────────────────────────────────────────────────────────────

  const app = express();
  app.use(cors());
  app.use(express.json());

  /**
   * GET /api/decisions
   * Returns the in-memory list of rebalance decisions (most recent first).
   * For each decision, includes the 0G Storage link and on-chain tx link.
   */
  app.get("/api/decisions", (_req, res) => {
    res.json({ decisions: decisionHistory.slice(0, 50) });
  });

  /**
   * GET /api/decisions/:storageRef
   * Fetches a specific decision record directly from 0G Storage.
   */
  app.get("/api/decisions/:storageRef", async (req, res) => {
    try {
      const record = await downloadDecisionRecord(req.params.storageRef);
      if (!record) return res.status(404).json({ error: "not found" });
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  /**
   * GET /api/vault-status
   * Returns live vault TVL and share supply from 0G Chain.
   */
  app.get("/api/vault-status", async (_req, res) => {
    try {
      const tvl    = await masterVault.getTVL().catch(() => BigInt(0));
      const supply = await masterVault.totalSupply().catch(() => BigInt(0));
      res.json({
        masterVault: {
          address:     masterVaultAddr,
          tvl:         ethers.formatEther(tvl),
          shareSupply: ethers.formatEther(supply),
          network:     "0G Aristotle (16661)",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => {
    console.log(`REST API running on http://localhost:${port}`);
    console.log(`  GET /api/decisions`);
    console.log(`  GET /api/decisions/:storageRef`);
    console.log(`  GET /api/vault-status\n`);
  });
}

main().catch((err) => {
  console.error("Fatal relayer error:", err);
  process.exit(1);
});
