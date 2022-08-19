import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {randomBytes} from "ethers/lib/utils"
import {BigNumber} from "ethers"
import {EtherSwap} from "../typechain-types"

describe("EtherSwap", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployEtherSwap() {
    const EtherSwapFactory = await ethers.getContractFactory("EtherSwap");
    return EtherSwapFactory.deploy();
  }

  async function deployCommit() {
    const etherSwap = await deployEtherSwap()

    const lockTime = 60 * 60;
    const secret = randomBytes(32)
    const hashedSecret = ethers.utils.keccak256(secret)
    const expectedAmount = 1
    const value = 2
    const recipient = ethers.constants.AddressZero

    await etherSwap.commit(lockTime, hashedSecret, expectedAmount, recipient, {"value": value})

    return {etherSwap, secret};
  }

  describe("Commit", function () {
    it("Should store proper commit", async function () {
      const etherSwap = await loadFixture(deployEtherSwap);

      const lockTime = 365 * 24 * 60 * 60;
      const hashedSecret = randomBytes(32)
      const expectedAmount = 1
      const value = 2
      const recipient = ethers.constants.AddressZero
      const txSender = (await ethers.getSigners())[0].address

      await etherSwap.commit(lockTime, hashedSecret, expectedAmount, recipient, {"value": value})

      const blockTime = (await ethers.provider.getBlock("latest")).timestamp

      const commit = await etherSwap.swaps(0)
      expect(commit.hashedSecret).to.equal(ethers.utils.hexlify(hashedSecret))
      expect(commit.initiator).to.equal(txSender)
      expect(commit.endTimeStamp).to.equal(blockTime + lockTime)
      expect(commit.recipient).to.equal(recipient)
      expect(commit.changeRecipientTimestamp).to.equal(0)
      expect(commit.value).to.equal(value)
      expect(commit.expectedAmount).to.equal(expectedAmount)

      expect(await etherSwap.provider.getBalance(etherSwap.address)).to.equal(value)
    });

    it("Should store proper commit with recipient", async function () {
      const etherSwap = await loadFixture(deployEtherSwap);

      const lockTime = 365 * 24 * 60 * 60;
      const hashedSecret = randomBytes(32)
      const expectedAmount = 1
      const value = 2
      const recipient = (await ethers.getSigners())[1].address
      const txSender = (await ethers.getSigners())[0].address

      await etherSwap.commit(lockTime, hashedSecret, expectedAmount, recipient, {"value": value})

      const blockTime = (await ethers.provider.getBlock("latest")).timestamp
      const maxUint64 = BigNumber.from(2).pow(64).sub(1)

      const commit = await etherSwap.swaps(0)
      expect(commit.hashedSecret).to.equal(ethers.utils.hexlify(hashedSecret))
      expect(commit.initiator).to.equal(txSender)
      expect(commit.endTimeStamp).to.equal(blockTime + lockTime)
      expect(commit.recipient).to.equal(recipient)
      expect(commit.changeRecipientTimestamp).to.equal(maxUint64)
      expect(commit.value).to.equal(value)
      expect(commit.expectedAmount).to.equal(expectedAmount)

      expect(await etherSwap.provider.getBalance(etherSwap.address)).to.equal(value)
    });

    it("Should emit a Commit event", async function () {
      const etherSwap = await loadFixture(deployEtherSwap);

      const lockTime = 365 * 24 * 60 * 60;
      const hashedSecret = randomBytes(32)
      const expectedAmount = 1
      const value = 2
      const recipient = (await ethers.getSigners())[1].address
      const txSender = (await ethers.getSigners())[0].address

      await expect(etherSwap.commit(lockTime, hashedSecret, expectedAmount, recipient, {"value": value})).to.emit(
          etherSwap, "Commit"
      ).withArgs(txSender, recipient, value, expectedAmount, (await ethers.provider.getBlock("latest")).timestamp + lockTime, hashedSecret, 0)
    });
  });

  describe("Change recipient", function () {

    it("Should change recipient from 0 address", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      const newRecipient = (await ethers.getSigners())[1].address
      await etherSwap.changeRecipient(0, newRecipient)

      const commit = await etherSwap.swaps(0)
      expect(commit.recipient).to.equal(newRecipient)
    });

    it("Should prevent recipient change before timestamp", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      let newRecipient = (await ethers.getSigners())[1].address
      await etherSwap.changeRecipient(0, newRecipient)

      const oldRecipient = newRecipient
      newRecipient = (await ethers.getSigners())[2].address
      await expect(etherSwap.changeRecipient(0, newRecipient)).to.be.revertedWith("Cannot change recipient: timestamp")

      const commit = await etherSwap.swaps(0)
      expect(commit.recipient).to.equal(oldRecipient)
    });

    it("Should allow recipient change after timestamp", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      let newRecipient = (await ethers.getSigners())[1].address
      await etherSwap.changeRecipient(0, newRecipient)

      newRecipient = (await ethers.getSigners())[2].address
      await ethers.provider.send("evm_increaseTime", [600])
      await etherSwap.changeRecipient(0, newRecipient)

      const commit = await etherSwap.swaps(0)
      expect(commit.recipient).to.equal(newRecipient)
    });

    it("Should emit a ChangeRecipient event", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      let newRecipient = (await ethers.getSigners())[1].address
      await expect(etherSwap.changeRecipient(0, newRecipient)).to.emit(etherSwap, "ChangeRecipient").withArgs(
          newRecipient, 0
      )
    });
  });

  describe("Claim", function () {
    it("Should claim", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      const recipient = (await ethers.getSigners())[1].address
      await etherSwap.changeRecipient(0, recipient)

      const balanceBefore = await ethers.provider.getBalance(recipient)
      await etherSwap.claim(0, secret)
      const balanceAfter = await ethers.provider.getBalance(recipient)

      expect(balanceAfter.sub(balanceBefore)).to.equal(2)
    });

    it("Should not claim twice in a row", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      const recipient = (await ethers.getSigners())[1].address
      await etherSwap.changeRecipient(0, recipient)

      await etherSwap.claim(0, secret)
      await expect(etherSwap.claim(0, secret)).to.be.reverted
    });

    it("Should not claim without recipient", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      await expect(etherSwap.claim(0, secret)).to.be.revertedWith("Swap has no recipient")
    });

    it("Should not claim with incorrect secret", async function () {
      const {etherSwap,} = await loadFixture(deployCommit);
      const secret = randomBytes(32)

      const recipient = (await ethers.getSigners())[1].address
      await etherSwap.changeRecipient(0, recipient)

      await expect(etherSwap.claim(0, secret)).to.be.revertedWith("Incorrect secret")
    });

    it("Should not claim expired swap secret", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      const recipient = (await ethers.getSigners())[1].address
      await etherSwap.changeRecipient(0, recipient)

      await ethers.provider.send("evm_increaseTime", [3600])

      await expect(etherSwap.claim(0, secret)).to.be.revertedWith("Swap expired")
    });
  });

  describe("Refund", function () {
    it("Should refund", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      const recipient = (await ethers.getSigners())[1]
      const committer = (await ethers.getSigners())[0].address
      await etherSwap.changeRecipient(0, recipient.address)

      const balanceBefore = await ethers.provider.getBalance(committer)
      await ethers.provider.send("evm_increaseTime", [3600])
      await etherSwap.connect(recipient).refund(0)
      const balanceAfter = await ethers.provider.getBalance(committer)

      expect(balanceAfter.sub(balanceBefore)).to.equal(2)
    });

    it("Should not refund before expiry", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      const recipient = (await ethers.getSigners())[1].address
      await etherSwap.changeRecipient(0, recipient)

      await expect(etherSwap.refund(0)).to.be.revertedWith("TimeStamp violation")
    });
  });

  describe("Refund & Claim", function () {
    it("Should not refund after claim", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      const recipient = (await ethers.getSigners())[1].address
      await etherSwap.changeRecipient(0, recipient)
      await etherSwap.claim(0, secret)

      await expect(etherSwap.refund(0)).to.be.revertedWith("Nothing to refund")
    });

    it("Should not claim after refund", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      const recipient = (await ethers.getSigners())[1].address
      await etherSwap.changeRecipient(0, recipient)

      await ethers.provider.send("evm_increaseTime", [3600])
      await etherSwap.refund(0)

      await expect(etherSwap.claim(0, secret)).to.be.revertedWith("Swap expired")
    });
  });
});