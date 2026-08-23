/**
 * 0G Compute integration for Oasis Protocol relayer.
 *
 * Uses the 0G Compute Router (https://router-api.0g.ai/v1) — an OpenAI-compatible
 * endpoint. API key is obtained from https://pc.0g.ai by depositing 0G tokens.
 *
 * The Router provides:
 *   - Single unified balance across providers
 *   - Automatic provider failover
 *   - TEE-signed responses (x-worker-signature header)
 *   - Provider-side cryptographic attestation
 *
 * We do NOT use a third-party LLM API (no OpenAI, Anthropic, etc.) as the
 * decision engine. All inference runs through 0G Compute's provider network.
 *
 * Reference: https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/overview
 */

// Using native global fetch (Node.js 18+)

export interface MarketData {
  vaultTVL: string;
  availableAdapters: {
    name: string;
    address: string;
    estimatedAPY: string; // labeled "illustrative" — DemoYieldAdapter has no real yield
    totalDeposited: string;
  }[];
  recentVolatility: number;
  requestId: number;
  timestamp: string;
}

export interface ComputeDecision {
  targetAdapter: string;
  targetAdapterAddress: string;
  allocationPercent: number;
  reasoning: string;
  confidence: number;
  attestation: string; // x-worker-signature from the 0G Compute response
  modelUsed: string;
}

/**
 * Submit inference to 0G Compute Router and return the rebalance decision.
 *
 * @param marketData  Current market/portfolio state to send to the model.
 * @returns           Decision including target adapter, reasoning, and TEE attestation.
 */
export async function submitComputeJob(marketData: MarketData): Promise<ComputeDecision> {
  const apiKey = process.env.OG_COMPUTE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OG_COMPUTE_API_KEY not set. Get one from https://pc.0g.ai by depositing 0G tokens."
    );
  }

  const endpoint = process.env.OG_COMPUTE_ENDPOINT || "https://router-api.0g.ai/v1";
  const model    = process.env.OG_COMPUTE_MODEL    || "llama-3.3-70b-instruct";

  const systemPrompt = `You are a verifiable AI yield optimization agent running on 0G Compute.
Your role is to decide which strategy adapter the Oasis vault should allocate funds to,
based on current market data. You must:
1. Choose exactly ONE adapter from the available list.
2. Specify what percentage of funds to allocate (0-100%).
3. Explain your reasoning concisely (2-3 sentences).
4. Provide a confidence score between 0 and 1.

Note: The DemoYieldAdapter is a placeholder with no real yield. Choose it only when
no other adapters are available, and state this clearly in your reasoning.

Respond ONLY with valid JSON in this exact format:
{
  "targetAdapter": "<adapter name>",
  "targetAdapterAddress": "<0x address>",
  "allocationPercent": <number 0-100>,
  "reasoning": "<2-3 sentence explanation>",
  "confidence": <0.0-1.0>
}`;

  const userMessage = `Current portfolio state:
- Vault TVL: ${marketData.vaultTVL}
- Recent volatility index: ${marketData.recentVolatility}
- Timestamp: ${marketData.timestamp}
- Request ID: ${marketData.requestId}

Available adapters:
${marketData.availableAdapters.map(a =>
  `  - Name: ${a.name}\n    Address: ${a.address}\n    Illustrative APY: ${a.estimatedAPY}\n    Deposited: ${a.totalDeposited}`
).join("\n")}

Decide which adapter to allocate to and provide your reasoning.`;

  const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage  },
      ],
      temperature: 0.2,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`0G Compute request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json() as {
    choices: { message: { content: string } }[];
    model:   string;
    id:      string;
  };

  // The TEE attestation is returned in the x-worker-signature response header
  const attestation = (response.headers.get("x-worker-signature") || "").trim();
  if (!attestation) {
    console.warn("[compute] Warning: no x-worker-signature in response. Proceed with caution.");
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("0G Compute returned empty response");
  }

  // Extract JSON from the response (model may wrap it in markdown code fences)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Could not parse JSON from 0G Compute response: ${content}`);
  }

  const decision = JSON.parse(jsonMatch[0]) as Omit<ComputeDecision, "attestation" | "modelUsed">;

  return {
    ...decision,
    attestation,
    modelUsed: data.model || model,
  };
}
