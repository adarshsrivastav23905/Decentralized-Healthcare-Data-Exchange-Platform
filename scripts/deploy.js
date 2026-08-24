// scripts/deploy.js
// ============================================================
//  Deployment Script for HealthcareDataExchange Contract
// ============================================================
//  Usage:
//    npx hardhat run scripts/deploy.js --network localhost
//
//  Before running, start a local node:
//    npx hardhat node
// ============================================================

const hre = require("hardhat");

async function main() {
  console.log("==============================================");
  console.log("  Deploying HealthcareDataExchange Contract");
  console.log("==============================================\n");

  // Get the contract factory
  const HealthcareDataExchange = await hre.ethers.getContractFactory(
    "HealthcareDataExchange"
  );

  // Deploy the contract
  const contract = await HealthcareDataExchange.deploy();

  // Wait for deployment to complete
  await contract.waitForDeployment();

  // Get the deployed contract address
  const contractAddress = await contract.getAddress();

  console.log(`✅ HealthcareDataExchange deployed to: ${contractAddress}`);
  console.log(`   Network: ${hre.network.name}`);
  console.log(`   Deployer (Admin): ${(await hre.ethers.getSigners())[0].address}`);
  console.log("\n==============================================");
  console.log("  Deployment Complete!");
  console.log("==============================================");

  // Save the contract address for frontend use
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
  };

  // Create the frontend config directory if it doesn't exist
  const configDir = "./frontend/src";
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(
    `${configDir}/contract-address.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n📄 Contract address saved to ${configDir}/contract-address.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
