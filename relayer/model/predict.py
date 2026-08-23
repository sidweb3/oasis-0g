"""
Oasis Protocol — XGBoost Yield Prediction Model
================================================
This model is used as the AI decision engine within the Oasis rebalancing system.
It runs on 0G Compute (via the Compute Router at https://router-api.0g.ai/v1).

The model predicts expected APY for each available strategy adapter given current
market conditions and determines the optimal allocation.

IMPORTANT: This Python file defines the model architecture and training logic.
In the actual 0G Compute deployment, this model is uploaded as a fine-tuned
inference endpoint. The TypeScript relayer (src/compute.ts) calls the
0G Compute Router API endpoint, which executes inference on the network's
GPU providers — NOT locally in Node.js.

This file is the authoritative model definition. It must NOT diverge from
what is deployed on 0G Compute. Any update to this file must be followed by:
  1. Retraining with new data
  2. Re-uploading to 0G Compute (if using a custom fine-tuned model endpoint)
  OR if using a general LLM via the Router:
  1. Updating the system prompt in relayer/src/compute.ts to match new logic
"""

import pandas as pd
import numpy as np
import xgboost as xgb
import json
from datetime import datetime

# Available strategy adapter names for 0G Chain Oasis deployment
# NOTE: DemoYieldAdapter is a placeholder. Add real adapters here when available on 0G Chain.
STRATEGY_ADAPTERS = [
    "demo_yield_adapter",  # DemoYieldAdapter — placeholder, no real yield
    # "lending_protocol_a",  # Uncomment when a real 0G lending protocol is available
    # "staking_protocol_b",  # Uncomment when a real 0G staking protocol is available
]


class OasisYieldPredictor:
    """XGBoost-based yield prediction model for Oasis vault on 0G Chain."""

    def __init__(self):
        self.model = xgb.XGBRegressor(
            objective="reg:squarederror",
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
        )
        self._trained = False

    def train(self, historical_data_path: str):
        """
        Train on historical APY data.
        Columns: current_yield, gas_cost, tvl, volatility, il_risk, target_apy_24h
        """
        df = pd.read_csv(historical_data_path)
        feature_cols = ["current_yield", "gas_cost", "tvl", "volatility", "il_risk"]
        X = df[feature_cols]
        y = df["target_apy_24h"]
        self.model.fit(X, y)
        self._trained = True
        print(f"[model] Trained on {len(df)} records")

    def predict(self, market_data: dict) -> dict:
        """
        Predict optimal allocation for 0G Chain strategy adapters.

        Input: {
            current_yield: float,  # Current weighted average yield across adapters
            gas_cost: float,       # Current 0G Chain gas cost estimate
            tvl: float,            # Current vault TVL in USDC
            volatility: float,     # Recent market volatility index
            il_risk: float         # Impermanent loss risk estimate
        }

        Output: {
            timestamp: str,
            predicted_apy: float,  # Illustrative — based on model, not guaranteed
            allocation: dict,      # Per-adapter allocation fractions (0-1)
            confidence: float,
            reasoning: str,
            note: str              # Honesty note about adapter status
        }
        """
        X_pred = pd.DataFrame([market_data])

        if self._trained:
            predicted_apy = float(self.model.predict(X_pred)[0])
        else:
            # Untrained fallback: use a simple heuristic
            predicted_apy = market_data.get("current_yield", 0.0) * 1.05

        # Allocation logic — 0G Chain adapters only
        # With only DemoYieldAdapter available, all funds go there by default.
        # This will improve as real protocols integrate with 0G Chain.
        allocation = {
            "demo_yield_adapter": 1.0,
            # Future: distribute based on predicted APY optimization
        }

        return {
            "timestamp": datetime.now().isoformat(),
            "predicted_apy": predicted_apy,
            "allocation": allocation,
            "confidence": 0.6 if not self._trained else 0.85,
            "reasoning": (
                "Only DemoYieldAdapter is currently available on 0G Chain. "
                "Allocating 100% to it by default. This adapter is a demo placeholder — "
                "no real yield is generated. Allocation will diversify as real protocols "
                "integrate with 0G Chain."
            ),
            "note": (
                "DemoYieldAdapter is a placeholder with no real yield source. "
                "The illustrative APY shown in the UI is not a guaranteed return."
            ),
        }


if __name__ == "__main__":
    predictor = OasisYieldPredictor()

    # Example prediction (untrained — heuristic mode)
    result = predictor.predict({
        "current_yield": 0.0,
        "gas_cost": 0.001,   # 0G Chain gas is very cheap
        "tvl": 10000.0,
        "volatility": 0.12,
        "il_risk": 0.01,
    })

    print(json.dumps(result, indent=2))
