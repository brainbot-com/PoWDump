import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {randomBytes} from "ethers/lib/utils"
import {BigNumber} from "ethers"
import {EtherSwap} from "../typechain-types"
import exp from "constants"

describe("EtherSwap", function () {

  const recipientChangeLockDuration = 10*60;
  const feeRecipient = "0x0000000000000000000000000000000000001234";
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

  describe("Commit", function () {
    it("Should commit with transaction expiry time and swap lock time", async function () {
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
    });

    it("Should commit with swap end timestamp", async function () {
      const etherSwap = await loadFixture(deployEtherSwap);

      const swapExpiryTime = (await ethers.provider.getBlock("latest")).timestamp * 2

      await etherSwap['commit(uint64,bytes32,uint256,uint256,address)'](
        swapExpiryTime, hashedSecret, swapValue, expectedAmount, ethers.constants.AddressZero, {"value": swapValue})

      const commit = await etherSwap.swaps(0)
      expect(commit.hashedSecret).to.equal(ethers.utils.hexlify(hashedSecret))
      expect(commit.initiator).to.equal(txSender)
      expect(commit.endTimeStamp).to.equal(swapExpiryTime)
      expect(commit.recipient).to.equal(ethers.constants.AddressZero)
      expect(commit.changeRecipientTimestamp).to.equal(0)
      expect(commit.value).to.equal(swapValue)
      expect(commit.expectedAmount).to.equal(expectedAmount)

      expect(await etherSwap.provider.getBalance(etherSwap.address)).to.equal(swapValue)
    });

    it("Should store proper commit with recipient", async function () {
      const etherSwap = await loadFixture(deployEtherSwap);

      await etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, recipient, {"value": swapValue})

      const blockTime = (await ethers.provider.getBlock("latest")).timestamp
      const maxUint64 = BigNumber.from(2).pow(64).sub(1)

      const commit = await etherSwap.swaps(0)
      expect(commit.hashedSecret).to.equal(ethers.utils.hexlify(hashedSecret))
      expect(commit.initiator).to.equal(txSender)
      expect(commit.endTimeStamp).to.equal(blockTime + lockTime)
      expect(commit.recipient).to.equal(recipient)
      expect(commit.changeRecipientTimestamp).to.equal(maxUint64)
      expect(commit.value).to.equal(swapValue)
      expect(commit.expectedAmount).to.equal(expectedAmount)

      expect(await etherSwap.provider.getBalance(etherSwap.address)).to.equal(swapValue)
    });

    it("Should emit a Commit event", async function () {
      const etherSwap = await loadFixture(deployEtherSwap);

      await expect(etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, recipient, {"value": swapValue})).to.emit(
          etherSwap, "Commit"
      ).withArgs(txSender, recipient, swapValue, expectedAmount, (await ethers.provider.getBlock("latest")).timestamp + lockTime, hashedSecret, 0)
    });

    it("Should not commit expired transaction", async function () {
      const etherSwap = await loadFixture(deployEtherSwap);

      const blockTime = (await ethers.provider.getBlock("latest")).timestamp

      await expect(etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](
        blockTime - 1, lockTime, hashedSecret, swapValue, expectedAmount, ethers.constants.AddressZero, {"value": swapValue}))
        .to.be.revertedWith("Transaction no longer valid")
    })
  });

  describe("Change recipient", function () {

    it("Should change recipient from 0 address", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      const commit = await etherSwap.swaps(0)
      expect(commit.recipient).to.equal(recipient)
    });

    it("Should prevent recipient change before timestamp", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      const oldRecipient = recipient
      const newRecipient = (await ethers.getSigners())[2].address
      await expect(etherSwap.changeRecipient(0, newRecipient)).to.be.revertedWith("Cannot change recipient: timestamp")

      const commit = await etherSwap.swaps(0)
      expect(commit.recipient).to.equal(oldRecipient)
    });

    it("Should allow recipient change after timestamp", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      const newRecipient = (await ethers.getSigners())[2].address
      await ethers.provider.send("evm_increaseTime", [recipientChangeLockDuration])
      await etherSwap.changeRecipient(0, newRecipient)

      const commit = await etherSwap.swaps(0)
      expect(commit.recipient).to.equal(newRecipient)
    });

    it("Should emit a ChangeRecipient event", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      await expect(etherSwap.changeRecipient(0, recipient)).to.emit(etherSwap, "ChangeRecipient").withArgs(
          recipient, 0
      )
    });
  });

  describe("Claim", function () {
    it("Should claim", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      const balanceBefore = await ethers.provider.getBalance(recipient)
      await etherSwap.claim(0, secret)
      const balanceAfter = await ethers.provider.getBalance(recipient)

      expect(balanceAfter.sub(balanceBefore)).to.equal(swapValue)
    });

    it("Should not claim twice in a row", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

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

      await etherSwap.changeRecipient(0, recipient)

      await expect(etherSwap.claim(0, secret)).to.be.revertedWith("Incorrect secret")
    });

    it("Should not claim expired swap secret", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      await ethers.provider.send("evm_increaseTime", [lockTime])

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
      await ethers.provider.send("evm_increaseTime", [lockTime])
      await etherSwap.connect(recipient).refund(0)
      const balanceAfter = await ethers.provider.getBalance(committer)

      expect(balanceAfter.sub(balanceBefore)).to.equal(swapValue)
    });

    it("Should not refund before expiry", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      await expect(etherSwap.refund(0)).to.be.revertedWith("TimeStamp violation")
    });
  });

  describe("Refund & Claim", function () {
    it("Should not refund after claim", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)
      await etherSwap.claim(0, secret)

      await expect(etherSwap.refund(0)).to.be.revertedWith("Nothing to refund")
    });

    it("Should not claim after refund", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      await ethers.provider.send("evm_increaseTime", [lockTime])
      await etherSwap.refund(0)

      await expect(etherSwap.claim(0, secret)).to.be.revertedWith("Swap expired")
    });
  });

  describe("Fees", function () {
    it("Should calculate the right fees", async function () {
      const etherSwap = await loadFixture(deployEtherSwapWithFees);

      const values = [1_234_000, 1_000_000, 1_234_000_000, 456, 888_888]
      const expectedFees = values.map(value => Math.floor(value * feePerMillion / 1_000_000))

      for (let i = 0; i < values.length; i++) {
        expect(etherSwap.feeFromSwapValue(values[i])).to.eventually.equal(expectedFees[i])
      }
    });

    it("Should collect fee on commit", async function () {
      const etherSwap = await loadFixture(deployEtherSwapWithFees);

      await etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, recipient, {"value": msgValue})

      const commit = await etherSwap.swaps(0)
      expect(commit.value).to.equal(swapValue)

      expect(await etherSwap.provider.getBalance(etherSwap.address)).to.equal(msgValue)
    });

    it("Should refuse commit with wrong fees", async function () {
      const etherSwap = await loadFixture(deployEtherSwapWithFees);

      await expect(etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, recipient, {"value": msgValue + 1}))
        .to.be.revertedWith("Ether value does not match payout + fee")
      await expect(etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, recipient, {"value": msgValue - 1}))
        .to.be.revertedWith("Ether value does not match payout + fee")
    });

    it("Should increase collected fees on claim", async function () {
      const etherSwap = await loadFixture(deployCommitWithFees);

      expect(etherSwap.collectedFees()).to.eventually.equal(0)

      await etherSwap.claim(0, secret)

      expect(etherSwap.collectedFees()).to.eventually.equal(swapFee)
      expect(etherSwap.provider.getBalance(etherSwap.address)).to.eventually.equal(swapFee)
    });

    it("Should reimburse fees on refund", async function () {
      const etherSwap = await loadFixture(deployCommitWithFees);

      const recipient = (await ethers.getSigners())[1]

      const balanceBefore = await ethers.provider.getBalance(txSender)
      await ethers.provider.send("evm_increaseTime", [lockTime + 1])
      await etherSwap.connect(recipient).refund(0)
      const balanceAfter = await ethers.provider.getBalance(txSender)

      expect(etherSwap.collectedFees()).to.eventually.equal(0)
      expect(balanceAfter.sub(balanceBefore)).to.equal(msgValue)
    });

    it("Should withdraw collected fees", async function () {
      const etherSwap = await loadFixture(deployCommitWithFees);

      await etherSwap.claim(0, secret)

      expect(etherSwap.collectedFees()).to.eventually.equal(1)
      expect(etherSwap.provider.getBalance(etherSwap.address)).to.eventually.equal(1)

      await etherSwap.withdrawFees()

      expect(etherSwap.collectedFees()).to.eventually.equal(0)
      expect(etherSwap.provider.getBalance(etherSwap.address)).to.eventually.equal(0)
      expect(etherSwap.provider.getBalance(feeRecipient)).to.eventually.equal(1)
    });

    it("Should emit WithdrawFees event", async function () {
      const etherSwap = await loadFixture(deployCommitWithFees);

      await etherSwap.claim(0, secret)

      expect(await etherSwap.withdrawFees()).to.emit(etherSwap, "WithdrawFees").withArgs(1)
    });
  });
});
