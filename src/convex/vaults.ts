import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

export const getVaults = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vaults").collect();
  },
});

export const getStrategies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("strategies").collect();
  },
});

// Internal queries for AI action to use
export const getVaultsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vaults").collect();
  },
});

export const getStrategiesInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("strategies").collect();
  },
});

export const getMetrics = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("metrics").order("desc").take(1);
  },
});

export const getRecentRebalances = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rebalances").order("desc").take(10);
  },
});

export const getRecentPredictions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("predictions").order("desc").take(5);
  },
});

// Store AI predictions in database
export const storePrediction = internalMutation({
  args: {
    predictedApy: v.number(),
    confidence: v.number(),
    allocation: v.string(),
    reasoning: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("predictions", {
      timestamp: Date.now(),
      predictedApy: args.predictedApy,
      confidenceScore: args.confidence,
      recommendedAllocation: args.allocation,
      modelId: "gpt-4o-mini-v1",
    });
  },
});

export const executeRebalance = mutation({
  args: {
    vaultId: v.id("vaults"),
    newAllocation: v.string(),
    predictedApy: v.number(),
  },
  handler: async (ctx, args) => {
    const vault = await ctx.db.get(args.vaultId);
    if (!vault) throw new Error("Vault not found");

    const oldAllocation = vault.allocations;

    // Update vault
    await ctx.db.patch(args.vaultId, {
      allocations: args.newAllocation,
      apy: args.predictedApy,
      lastRebalance: Date.now(),
    });

    // Record rebalance
    await ctx.db.insert("rebalances", {
      vaultId: args.vaultId,
      timestamp: Date.now(),
      txHash: "0x" + Math.random().toString(16).slice(2, 42),
      oldAllocation,
      newAllocation: args.newAllocation,
      gasCost: 0.35 + Math.random() * 0.2,
      reason: "AI Optimization Execution",
    });
  },
});

export const deposit = mutation({
  args: {
    vaultId: v.id("vaults"),
    amount: v.number(),
    walletAddress: v.optional(v.string()),
    token: v.optional(v.string()),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const vault = await ctx.db.get(args.vaultId);
    if (!vault) throw new Error("Vault not found");

    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    await ctx.db.patch(args.vaultId, {
      tvl: vault.tvl + args.amount,
    });

    await ctx.db.insert("deposits", {
      userId: userId ? (userId as any) : undefined,
      walletAddress: args.walletAddress || "unknown",
      vaultId: args.vaultId,
      amount: args.amount,
      token: args.token || "USDC", // "USDC" or "POL"
      txHash: args.txHash,
      timestamp: Date.now(),
      status: "confirmed",
    });

    const metrics = await ctx.db.query("metrics").order("desc").first();
    if (metrics) {
      await ctx.db.patch(metrics._id, {
        totalTvl: metrics.totalTvl + args.amount,
      });
    }
  },
});

// Get user deposits
export const getUserDeposits = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const deposits = await ctx.db
      .query("deposits")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .order("desc")
      .collect();

    // Enrich with vault data
    const depositsWithVault = await Promise.all(
      deposits.map(async (deposit) => {
        const vault = await ctx.db.get(deposit.vaultId);
        return {
          ...deposit,
          vaultName: vault?.name || "Unknown Vault",
        };
      })
    );

    return depositsWithVault;
  },
});

// Get all deposits (for admin/monitoring)
export const getAllDeposits = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("deposits").order("desc").take(50);
  },
});

// Seed data for demo purposes
export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingVaults = await ctx.db.query("vaults").collect();
    if (existingVaults.length > 0) return;

    const vaultId = await ctx.db.insert("vaults", {
      name: "Oasis Master Vault",
      chainId: 16661,
      tvl: 0,
      apy: 0,
      allocations: JSON.stringify({
        "DemoYieldAdapter (0G Aristotle)": 100
      }),
      lastRebalance: Date.now() - 3600000 * 4,
    });

    await ctx.db.insert("strategies", {
      name: "Aave V3 USDC",
      protocol: "Aave",
      chain: "Polygon PoS",
      currentApy: 8.5,
      riskScore: 2,
      tvl: 500000,
    });

    await ctx.db.insert("strategies", {
      name: "QuickSwap ETH-USDC",
      protocol: "QuickSwap",
      chain: "Polygon zkEVM",
      currentApy: 18.2,
      riskScore: 6,
      tvl: 450000,
    });

    await ctx.db.insert("strategies", {
      name: "Beefy Vault",
      protocol: "Beefy",
      chain: "Polygon CDK",
      currentApy: 22.5,
      riskScore: 8,
      tvl: 300000,
    });

    await ctx.db.insert("metrics", {
      timestamp: Date.now(),
      totalTvl: 1250000,
      averageApy: 14.2,
      gasSaved: 4500,
      uniqueDepositors: 128,
    });
    
    await ctx.db.insert("rebalances", {
      vaultId,
      timestamp: Date.now() - 86400000,
      txHash: "0x712...99aa",
      oldAllocation: JSON.stringify({"Aave": 50, "QuickSwap": 50}),
      newAllocation: JSON.stringify({"Aave": 30, "QuickSwap": 40, "Beefy": 30}),
      gasCost: 0.45,
      reason: "AI Yield Optimization",
    });
  },
});