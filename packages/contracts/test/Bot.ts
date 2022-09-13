import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {randomBytes} from "ethers/lib/utils"
import {BigNumber} from "ethers"
import {EtherSwap} from "../typechain-types"
import exp from "constants"

const hre = require("hardhat");

describe("Bot", function () {

  const recipientChangeLockDuration = 10*60;
  const feeRecipient = "0x5678000000000000000000000000000000001234";
  const feePerMillion = 1000

  const lockTime = 365 * 24 * 60 * 60;
  let transactionExpiry: number;
  const secret = randomBytes(32)
  const hashedSecret = ethers.utils.keccak256(secret)
  const expectedAmount = 1
  const swapValue = 1_000
  const swapFee = 1
  const msgValue = swapValue + swapFee
  let recipient = ""
  let txSender = ""

  before(async function() {
    recipient = (await ethers.getSigners())[1].address
    txSender = (await ethers.getSigners())[0].address
    transactionExpiry = (await ethers.provider.getBlock("latest")).timestamp * 100
  });

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployEtherSwap() {
    const EtherSwapFactory = await ethers.getContractFactory("EtherSwap");
    return EtherSwapFactory.deploy(recipientChangeLockDuration, ethers.constants.AddressZero, 0);
  }

  async function deployEtherSwapWithFees() {
    const EtherSwapFactory = await ethers.getContractFactory("EtherSwap");
    return EtherSwapFactory.deploy(recipientChangeLockDuration, feeRecipient, feePerMillion);
  }

  async function deployCommit() {
    const etherSwap = await deployEtherSwap()

    await etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, ethers.constants.AddressZero, {"value": swapValue})

    return {etherSwap, secret};
  }

  async function deployCommitWithFees() {
    const etherSwap = await deployEtherSwapWithFees()

    await etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, recipient, {"value": msgValue})

    return etherSwap;
  }

  describe("Bot setup", function () {

    it("Should commit with transaction expiry time and swap lock time", async function () {
      hre.changeNetwork('pos_local');

      const etherSwap = await loadFixture(deployEtherSwap);

      await etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](
        transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, ethers.constants.AddressZero, {"value": swapValue})

      const blockTime = (await ethers.provider.getBlock("latest")).timestamp

      const commit = await etherSwap.swaps(0)
      expect(commit.hashedSecret).to.equal(ethers.utils.hexlify(hashedSecret))
      expect(commit.initiator).to.equal(txSender)
      expect(commit.endTimeStamp).to.equal(blockTime + lockTime)
      expect(commit.recipient).to.equal(ethers.constants.AddressZero)
      expect(commit.changeRecipientTimestamp).to.equal(0)
      expect(commit.value).to.equal(swapValue)
      expect(commit.expectedAmount).to.equal(expectedAmount)

      expect(await etherSwap.provider.getBalance(etherSwap.address)).to.equal(swapValue)
      console.log((await ethers.provider.getBlock("latest")).number)

      hre.changeNetwork('pow_local')
      console.log((await ethers.provider.getBlock("latest")).number)

    });
  });
});
