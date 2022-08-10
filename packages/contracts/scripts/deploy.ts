import { ethers } from "hardhat";
const hre = require("hardhat");
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const EtherSwap = await ethers.getContractFactory("EtherSwap");
  const swap = await EtherSwap.deploy();

  await swap.deployed();

  console.log("EtherSwap contract deployed to:", swap.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
