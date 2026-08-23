/**
 * 0G Storage integration for Oasis Protocol relayer.
 *
 * Uses the official @0gfoundation/0g-storage-ts-sdk TypeScript SDK.
 * The SDK uses an indexer pattern: it connects to the storage indexer node
 * which manages node selection and routes uploads/downloads.
 *
 * Mainnet indexer: https://indexer-storage-turbo.0g.ai
 * (NOT a plain HTTP upload API — the indexer selects storage nodes dynamically)
 *
 * Reference: https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk
 * Starter kit: https://github.com/0gfoundation/0g-storage-ts-starter-kit
 *
 * What we store per rebalance decision:
 * {
 *   requestId, timestamp, inputs (marketData), output (decision), reasoning,
 *   confidence, modelUsed, attestation, onChainTxHash
 * }
 *
 * The 0G Storage root hash returned by upload becomes the storageRef that is
 * recorded on-chain in RebalanceExecutor.executeRebalance() and in StrategyAgenticID.
 */

import type { ComputeDecision, MarketData } from "./compute.js";

// 0G Storage TS SDK types (installed via @0gfoundation/0g-storage-ts-sdk)
// If the package is not yet available under that exact name, check:
//   npm view @0gfoundation/0g-storage-ts-sdk
//   npm view 0g-storage-client
// and update the import path accordingly.
let ZgFile: any;
let Indexer: any;

async function loadSdk() {
  if (!ZgFile) {
    try {
      const sdk = await import("@0gfoundation/0g-storage-ts-sdk");
      ZgFile  = sdk.ZgFile  || sdk.default?.ZgFile;
      Indexer = sdk.Indexer || sdk.default?.Indexer;
    } catch (err: any) {
      console.warn("[STORAGE AUDIT WARNING] ⚠️ @0gfoundation/0g-storage-ts-sdk not found, trying 0g-storage-client package fallback. Error:", err?.message || err);
      // Fallback: try the storage-client package name used in the starter kit
      const sdk = await import("0g-storage-client" as any);
      ZgFile  = sdk.ZgFile;
      Indexer = sdk.Indexer;
    }
  }
}

export interface DecisionRecord {
  requestId:    number;
  timestamp:    string;
  inputs:       MarketData;
  decision:     ComputeDecision;
  onChainTxHash?: string;
}

/**
 * Upload a rebalance decision record to 0G Storage.
 *
 * @param record  The full decision record to persist.
 * @returns       The 0G Storage root hash (content reference) to record on-chain.
 */
export async function uploadDecisionRecord(record: DecisionRecord): Promise<string> {
  const indexerUrl = process.env.OG_STORAGE_INDEXER_URL || "https://indexer-storage-turbo.0g.ai";
  const evmRpcUrl  = process.env.OG_RPC_URL             || "https://evmrpc.0g.ai";
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY not set — needed to sign 0G Storage transactions");
  }

  await loadSdk();

  const json = JSON.stringify(record, null, 2);
  const blob = Buffer.from(json, "utf8");

  // Create an in-memory ZgFile from the JSON blob
  const zgFile = await ZgFile.fromBuffer(blob);
  const [tree, err1] = await zgFile.merkleTree();
  if (err1 || !tree) {
    throw new Error(`0G Storage merkle tree error: ${err1}`);
  }

  const rootHash = tree.rootHash();

  // Connect to the indexer
  const indexer = new Indexer(indexerUrl);

  // Upload (the SDK handles node selection via the indexer internally)
  const [txHash, err2] = await indexer.upload(zgFile, evmRpcUrl, privateKey, {
    expectedReplica: 1,
    method: "min",
  });

  if (err2) {
    throw new Error(`0G Storage upload error: ${err2}`);
  }

  console.log(`[storage] Decision uploaded. rootHash=${rootHash} txHash=${txHash}`);

  // Readback verification: download and compare
  await verifyUpload(indexer, rootHash, blob);

  return rootHash as string;
}

/**
 * Verify upload by downloading the content and comparing byte-for-byte.
 */
async function verifyUpload(indexer: any, rootHash: string, originalBlob: Buffer): Promise<void> {
  const [downloaded, err] = await indexer.download(rootHash, { withProof: false });
  if (err || !downloaded) {
    throw new Error(`0G Storage readback failed for ${rootHash}: ${err}`);
  }

  const downloadedBuf = Buffer.isBuffer(downloaded) ? downloaded : Buffer.from(downloaded);

  if (!downloadedBuf.equals(originalBlob)) {
    throw new Error(
      `0G Storage byte-level verification FAILED for ${rootHash}. ` +
      `Uploaded ${originalBlob.length} bytes, got back ${downloadedBuf.length} bytes.`
    );
  }

  console.log(`[storage] Byte-level verification passed for rootHash=${rootHash} ✓`);
}

/**
 * Download a decision record from 0G Storage by its root hash reference.
 * Used by the relayer REST API to serve decision history to the frontend.
 */
export async function downloadDecisionRecord(rootHash: string): Promise<DecisionRecord | null> {
  const indexerUrl = process.env.OG_STORAGE_INDEXER_URL || "https://indexer-storage-turbo.0g.ai";

  await loadSdk();

  const indexer = new Indexer(indexerUrl);
  const [data, err] = await indexer.download(rootHash, { withProof: false });

  if (err || !data) {
    console.error(`[storage] Download failed for ${rootHash}: ${err}`);
    return null;
  }

  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return JSON.parse(buf.toString("utf8")) as DecisionRecord;
}

/**
 * Build a 0G StorageScan URL for a given root hash.
 * Used to show live links in the frontend reasoning feed.
 */
export function storageExplorerUrl(rootHash: string): string {
  return `https://storagescan.0g.ai/tx/${rootHash}`;
}
