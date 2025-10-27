const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ConfidentialPayroll contract...");

  // Get the contract factory
  const ConfidentialPayroll = await hre.ethers.getContractFactory("ConfidentialPayroll");
  
  // Deploy the contract
  const payroll = await ConfidentialPayroll.deploy();
  
  // Wait for deployment
  await payroll.waitForDeployment();
  
  // Get the deployed address
  const address = await payroll.getAddress();
  
  console.log("✅ ConfidentialPayroll deployed to:", address);
  console.log("\n📋 Save this address for frontend integration!");
  
  // Save deployment info to a file
  const fs = require('fs');
  const deploymentInfo = {
    address: address,
    network: hre.network.name,
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📁 Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
