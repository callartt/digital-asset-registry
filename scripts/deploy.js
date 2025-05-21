const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const DigitalAsset = await hre.ethers.getContractFactory("DigitalAsset");
  const contract = await DigitalAsset.deploy();

  console.log(`✅ Contract deployed at: ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
