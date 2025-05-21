const hre = require("hardhat"); //тестовий скрипт

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const DigitalAsset = await hre.ethers.getContractAt("DigitalAsset", contractAddress);

  const tokenURI = "https://ipfs.io/ipfs/bafybeibk64izf6f4drjqgae7dcnx2pu3aepkp4daplc4nspv3lusk27quu";
  const tx = await DigitalAsset.mintAsset(deployer.address, tokenURI);

  await tx.wait();

  console.log("NFT створено");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
