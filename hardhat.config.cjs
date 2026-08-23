require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // 0G Chain (Aristotle) supports the Cancun EVM version.
      evmVersion: "cancun",
    },
  },
  networks: {
    // ── 0G Chain Mainnet (Aristotle) ──────────────────────────────────────────
    aristotle: {
      url: process.env.OG_RPC_URL || "https://evmrpc.0g.ai",
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 16661,
      timeout: 120000,
    },

    // ── Local Hardhat network (for running tests before mainnet deploy) ────────
    hardhat: {
      chainId: 31337,
    },
  },

  // 0G Chain does not have a public Etherscan-compatible verifier API yet.
  // Update this block when chainscan.0g.ai publishes an API key endpoint.
  etherscan: {
    apiKey: {
      aristotle: process.env.CHAINSCAN_API_KEY || "no-api-key-yet",
    },
    customChains: [
      {
        network: "aristotle",
        chainId: 16661,
        urls: {
          apiURL: "https://chainscan.0g.ai/api",
          browserURL: "https://chainscan.0g.ai",
        },
      },
    ],
  },
};
