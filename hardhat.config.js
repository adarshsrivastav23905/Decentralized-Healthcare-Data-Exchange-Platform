// hardhat.config.js
// ============================================================
// Hardhat Configuration for Healthcare Data Exchange Platform
// ============================================================

require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local Hardhat network (default)
    hardhat: {
      chainId: 31337,
    },
    // Local node (when running `npx hardhat node`)
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // ---------------------------------------------------------
    // OPTIONAL: Uncomment to deploy to Sepolia testnet
    // Requires a .env file with SEPOLIA_RPC_URL and PRIVATE_KEY
    // ---------------------------------------------------------
    // sepolia: {
    //   url: process.env.SEPOLIA_RPC_URL || "",
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    //   chainId: 11155111,
    // },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
