import { ethers } from "ethers";
import artifact from "./abis/DigitalAsset.json";

const contractABI = artifact.abi;
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const getContract = (signerOrProvider) => {
  return new ethers.Contract(contractAddress, contractABI, signerOrProvider);
};
