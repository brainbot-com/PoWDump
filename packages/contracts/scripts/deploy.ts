import { ethers } from "hardhat";
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const recipientChangeLockDuration = 10*60;
  const feeRecipient = "0x0000000000000000000000000000000000001234";
  const feePerMillion = 1000

  console.log("Using default params for deployment:")
  console.log("Recipient change lock duration:", recipientChangeLockDuration)
  console.log("Fee recipient:", feeRecipient)
  console.log("Fee per million:", feePerMillion)

  const EtherSwap = await ethers.getContractFactory("EtherSwap");
  const swap = await EtherSwap.deploy(recipientChangeLockDuration, feeRecipient, feePerMillion);

  await swap.deployed();

  console.log("EtherSwap contract deployed to:", swap.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
