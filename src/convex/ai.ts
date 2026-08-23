"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { vly } from "../lib/vly-integrations";

// Simulate AI prediction action with 0G Compute parameters
export const predictYield = action({
  args: {},
  handler: async (ctx) => {
    try {
      const strategies = await ctx.runQuery(internal.vaults.getStrategiesInternal);
      const vaults = await ctx.runQuery(internal.vaults.getVaultsInternal);

      const marketData = strategies.map((s: { name: string; chain: string; currentApy: number; riskScore: number; tvl: number }) =>
        `- ${s.name} (${s.chain}): ${s.currentApy}% APY, Risk Score: ${s.riskScore}/10, TVL: $${s.tvl.toLocaleString()}`
      ).join('\n');

      const currentVault = vaults[0];
      const currentAllocation = currentVault ? JSON.parse(currentVault.allocations) : {};

      const prompt = `
        You are an elite DeFi Yield Optimizer AI running on 0G Compute for Oasis Protocol on 0G Chain.
        
        Current Market Data:
${marketData}
        
        Current Portfolio Allocation:
${Object.entries(currentAllocation).map(([name, pct]) => `- ${name}: ${pct}%`).join('\n')}
        
        Task: Analyze conditions and suggest the optimal portfolio allocation for 0G Chain strategy adapters.
        
        Return ONLY a JSON object with this exact structure:
        {
          "predictedApy": number,
          "confidence": number,
          "allocation": {
            "DemoYieldAdapter (0G Aristotle)": 100
          },
          "reasoning": "brief explanation"
        }
      `;

      const result = await vly.ai.completion({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 600,
        temperature: 0.7,
      });

      let parsed: { predictedApy: number; confidence: number; allocation: Record<string, number>; reasoning: string };
      try {
        const text = (result as any).text.trim().replace(/^```json/, '').replace(/```$/, '').trim();
        parsed = JSON.parse(text);
      } catch {
        parsed = {
          predictedApy: 5.0,
          confidence: 0.85,
          allocation: { "DemoYieldAdapter (0G Aristotle)": 100 },
          reasoning: "Allocating 100% to DemoYieldAdapter on 0G Chain Aristotle. Note: demo adapter is a placeholder with no real yield."
        };
      }

      await ctx.runMutation(internal.vaults.recordPredictionInternal, {
        predictedApy: parsed.predictedApy,
        confidence: parsed.confidence,
        allocation: JSON.stringify(parsed.allocation),
        reasoning: parsed.reasoning,
      });

      return parsed;

    } catch (error) {
      console.error("AI prediction error:", error);
      const fallback = {
        predictedApy: 5.0,
        confidence: 0.75,
        allocation: JSON.stringify({ "DemoYieldAdapter (0G Aristotle)": 100 }),
        reasoning: "Fallback decision: 100% to DemoYieldAdapter on 0G Chain (illustrative placeholder)."
      };

      await ctx.runMutation(internal.vaults.recordPredictionInternal, {
        predictedApy: fallback.predictedApy,
        confidence: fallback.confidence,
        allocation: fallback.allocation,
        reasoning: fallback.reasoning,
      });

      return {
        ...fallback,
        allocation: JSON.parse(fallback.allocation)
      };
    }
  },
});