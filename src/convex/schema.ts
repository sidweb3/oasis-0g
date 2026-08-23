import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove
      role: v.optional(roleValidator), // role of the user. do not remove
      
      // App specific fields
      walletAddress: v.optional(v.string()),
      totalDeposited: v.optional(v.number()),
      xp: v.optional(v.number()),
    }).index("email", ["email"]),

    // Vaults tracking
    vaults: defineTable({
      name: v.string(),
      chainId: v.number(),
      tvl: v.number(),
      apy: v.number(),
      allocations: v.string(), // JSON string of current allocations
      lastRebalance: v.number(),
    }),

    // Strategies available
    strategies: defineTable({
      name: v.string(),
      protocol: v.string(),
      chain: v.string(),
      currentApy: v.number(),
      riskScore: v.number(),
      tvl: v.number(),
    }),

    // Rebalance history
    rebalances: defineTable({
      vaultId: v.id("vaults"),
      timestamp: v.number(),
      txHash: v.string(),
      oldAllocation: v.string(), // JSON
      newAllocation: v.string(), // JSON
      gasCost: v.number(),
      reason: v.string(), // e.g. "AI Prediction"
    }).index("by_vault", ["vaultId"]),

    // AI Predictions
    predictions: defineTable({
      timestamp: v.number(),
      predictedApy: v.number(),
      confidenceScore: v.number(),
      recommendedAllocation: v.string(), // JSON
      modelId: v.string(),
    }).index("by_timestamp", ["timestamp"]),

    // Metrics for dashboard
    metrics: defineTable({
      timestamp: v.number(),
      totalTvl: v.number(),
      averageApy: v.number(),
      gasSaved: v.number(),
      uniqueDepositors: v.number(),
    }).index("by_timestamp", ["timestamp"]),

    // User deposits history
    deposits: defineTable({
      userId: v.optional(v.id("users")),
      walletAddress: v.string(),
      vaultId: v.id("vaults"),
      amount: v.number(),
      token: v.string(), // "USDC" or "MATIC"
      txHash: v.optional(v.string()),
      timestamp: v.number(),
      status: v.string(), // "pending" | "confirmed" | "failed"
    })
      .index("by_wallet", ["walletAddress"])
      .index("by_vault", ["vaultId"])
      .index("by_timestamp", ["timestamp"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;