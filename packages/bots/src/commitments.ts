import { ethers, utils, BigNumber } from "ethers";
import { TransactionReceipt } from "@ethersproject/abstract-provider";

import { AddressZero } from "@ethersproject/constants";
import { getConfig } from "./config";
import { formatEther } from "ethers/lib/utils";
import Queue from "better-queue";

type SwapCommitment = {
  id: string;
  swap: {
    initiator: string;
    recipient: string;
    value: BigNumber;
    expectedAmount: BigNumber;
    endTimeStamp: BigNumber;
    hashedSecret: string;
    id: number;
  };
};

const getCommitLog = (receipt: TransactionReceipt) => {
  const config = getConfig();

  const abi = config.abi;
  let iface = new ethers.utils.Interface(abi);
  return iface.parseLog(receipt.logs[0]);
};
const getCommitmentInTransaction = async (
  txHash: string
): Promise<SwapCommitment> => {
  const config = getConfig();
  const sourceProvider = config.source.provider;

  const receipt = await sourceProvider.getTransactionReceipt(txHash);

  const log = getCommitLog(receipt);
  const { id } = log.args;
  const contractSwap = await getSwapFromSourceContract(id);

  return {
    id: id,
    swap: {
      initiator: contractSwap.initiator,
      recipient: contractSwap.recipient,
      value: contractSwap.value,
      expectedAmount: contractSwap.expectedAmount,
      endTimeStamp: contractSwap.endTimeStamp,
      hashedSecret: contractSwap.hashedSecret,
      id: id
    }
  };
};

const getSwapFromSourceContract = async (id: string) => {
  const config = getConfig();
  const sourceContract = config.source.contract;
  return sourceContract.swaps(id);
};

export const matchCommitmentBySwapId = async (id: string) => {
  const swap = await getSwapFromSourceContract(id);
  const swapCommitment = {
    id,
    swap
  };

  try {
    await match(swapCommitment);
    await watchForReveal();
  } catch (e) {
    console.log("match failed", e);
  }
};

export const matchCommitmentTx = async (
  transactionWithSwapCommitment: string
) => {
  const swapCommitment = await getCommitmentInTransaction(
    transactionWithSwapCommitment
  );

  try {
    await match(swapCommitment);
    await watchForReveal();
  } catch (e) {
    console.log("match failed", e);
  }
};

const watchForReveal = async () => {
  const config = getConfig();
  const targetContract = config.target.contract;
  const revealFilter = {
    address: targetContract.address,
    topics: [utils.id("Claim(address,uint256,bytes32,uint32)")]
  };

  targetContract.on(revealFilter, async (...theArgs) => {
    const id = theArgs[3];
    const proof = theArgs[2];
    const sourceId = matchedQueue[id];

    console.log(`============= Reveal found: ${id} start =============`);

    if (sourceId) {
      console.log(
        `> It appears we've matched this on source chain: ${sourceId} start`
      );

      try {
        await claim(sourceId, proof);
      } catch (error) {
        console.log("> couldn't claim", error);
      }
    } else {
      console.log(
        `> Someone Revealed the proof to ${id} but we didn't match it in the first place. Nothing to do...`
      );
    }

    targetContract.removeAllListeners(revealFilter);
    console.log(`============= Reveal ${id} completed =============`);
  });
};

// targetId -> sourceId
let matchedQueue: { [id: string]: string } = {};

const match = async (swapCommitment: SwapCommitment) => {
  const config = getConfig();

  const id = swapCommitment.id;
  const {
    initiator,
    recipient,
    value,
    expectedAmount,
    endTimeStamp,
    hashedSecret
  } = swapCommitment.swap;

  console.log(`> Trying to match commitment ${id}`);

  if (value.eq(BigNumber.from(0))) {
    throw new Error(`> Source commitment ${id} appears to be claimed`);
  }

  if (endTimeStamp.lt(BigNumber.from(Math.floor(Date.now() / 1000)))) {
    throw new Error(`> Source commitment ${id} appears to be expired`);
  }

  if (
    endTimeStamp.lt(
      BigNumber.from(Math.floor((Date.now() + 1000 * 60 * 3) / 1000))
    )
  ) {
    throw new Error(`> Source commitment ${id} appears to be expired`);
  }

  const sourceContract = config.source.contract;
  const sourceWallet = config.source.wallet;

  if (AddressZero === recipient) {
    // First add recipient to source commitment

    console.log(`> Trying to add recipient to commitment ${id}`);
    const changeRecipientResponse = await sourceContract.changeRecipient(
      id,
      sourceWallet.address
    );

    const addRecipient = await changeRecipientResponse.wait();

    if (addRecipient.status === 0) {
      throw new Error(
        `> Failed to add recipient to commitment ${id}. Tx hash: ${addRecipient.transactionHash}`
      );
    }

    console.log(
      "> recipient was added on source chain",
      addRecipient.transactionHash
    );
  } else if (recipient !== sourceWallet.address) {
    throw new Error(
      `A different address is already set as recipient ${recipient}`
    );
  }

  const ethSwapContractOnTarget = config.target.contract;

  console.log(`> Trying to add commitment ${id} on target chain`);
  const fee = await ethSwapContractOnTarget.feeFromSwapValue(expectedAmount);
  const commitmentOnTargetResponse = await ethSwapContractOnTarget[
    "commit(uint64,bytes32,uint256,uint256,address)"
  ](endTimeStamp, hashedSecret, expectedAmount, value, initiator, {
    value: expectedAmount.add(fee)
  });

  const commitmentReceipt = await commitmentOnTargetResponse.wait();

  if (commitmentReceipt.status === 0) {
    throw new Error(
      `> Failed to commit on target chain. Tx hash: ${commitmentReceipt.transactionHash}`
    );
  }

  const myTxLogs = getCommitLog(commitmentReceipt);
  console.log(
    "> commitment was created on target chain",
    commitmentReceipt.transactionHash
  );

  const targetSwap = myTxLogs.args;
  console.log(`>             id: ${targetSwap.id}`);
  console.log(`>      Initiator: ${targetSwap.initiator}`);
  console.log(`>      recipient: ${targetSwap.recipient}`);
  console.log(`>     Locked ETH: ${formatEther(targetSwap.value)}`);
  console.log(`> expectedAmount: ${formatEther(targetSwap.value)}`);
  console.log(`>   hashedSecret: ${targetSwap.hashedSecret}`);

  console.log(`> Now waiting for user to reveal secret`);

  matchedQueue[targetSwap.id] = id;

  return true;
};

/**
 * We are using a queue here because the on filters can be called multiple times
 * right when we are in the middle of a matching tx. If we don't make sure that
 * we execute the matching tx one by one we end up in a situation where TXs are
 * failing due to wrong nonces.
 *
 * This has a downside of not being able to match multiple commitments at the same time
 * and being somewhat slow since we wait for the receipt of each transaction before we proceed.
 * We could mitigate this by having multiple private_keys and using them in parallel.
 */
export const watchForCommitments = async () => {
  const config = getConfig();
  const queue = new Queue(
    async (fn: Function, cb: Function) => {
      console.log("------ Process queue entry start ------");
      await fn();
      console.log("------ Process queue entry end ------");
      cb();
    },
    { concurrent: 1 }
  );

  const sourceContract = config.source.contract;
  const targetContract = config.target.contract;

  const filter = {
    address: sourceContract.address,
    topics: [
      utils.id("Commit(address,address,uint256,uint256,uint64,bytes32,uint32)")
    ]
  };

  console.log("watching for commitments on source chain");
  sourceContract.on(filter, async (...theArgs) => {
    const swapCommitment = {
      id: theArgs[6],
      swap: {
        initiator: theArgs[0],
        recipient: theArgs[1],
        value: theArgs[2],
        expectedAmount: theArgs[3],
        endTimeStamp: theArgs[4],
        hashedSecret: theArgs[5],
        id: theArgs[6]
      }
    };

    console.log(
      `============= Commitment ${swapCommitment.id} found =============`
    );
    console.log(`     Initiator: ${swapCommitment.swap.initiator}`);
    console.log(`     recipient: ${swapCommitment.swap.recipient}`);
    console.log(`    Locked ETH: ${formatEther(swapCommitment.swap.value)}`);
    console.log(`expectedAmount: ${formatEther(swapCommitment.swap.value)}`);
    console.log(`  hashedSecret: ${swapCommitment.swap.hashedSecret}`);

    queue.push(async () => {
      try {
        await match(swapCommitment);
      } catch (error) {
        console.log("> couldn't match commitment", error);
      }
    });

    console.log(
      `============= Commitment ${swapCommitment.id} added to queue. =============`
    );
  });

  const revealFilter = {
    address: targetContract.address,
    topics: [utils.id("Claim(address,uint256,bytes32,uint32)")]
  };

  console.log("watching for reveals on target chain");

  targetContract.on(revealFilter, async (...theArgs) => {
    const id = theArgs[3];
    const proof = theArgs[2];
    const sourceId = matchedQueue[id];

    console.log(`============= Reveal found: ${id} start =============`);

    if (sourceId) {
      console.log(
        `> It appears we've matched this on source chain: ${sourceId} start`
      );

      queue.push(async () => {
        try {
          await claim(sourceId, proof);
        } catch (error) {
          console.log("> couldn't claim", error);
        }
      });
    } else {
      console.log(
        `> Someone Revealed the proof to ${id} but we didn't match it in the first place. Nothing to do...`
      );
    }

    console.log(`============= Reveal ${id} added to queue =============`);
  });
};

const claim = async (sourceId: string, proof: string) => {
  const config = getConfig();
  const sourceWallet = config.source.wallet;
  const sourceContract = config.source.contract;

  console.log(`> Trying to claim commitment ${sourceId} start`);

  const sourceSwap = await getSwapFromSourceContract(sourceId);

  if (sourceSwap.value.eq(BigNumber.from(0))) {
    throw new Error(`> Source commitment ${sourceId} appears to be claimed`);
  }

  if (sourceSwap.recipient === sourceWallet.address) {
    console.log(`>             sourceSwap id: ${sourceId}`);
    console.log(`>      sourceSwap initiator: ${sourceSwap.initiator}`);
    console.log(`>      sourceSwap recipient: ${sourceSwap.recipient}`);
    console.log(
      `>     sourceSwap Locked ETH: ${formatEther(sourceSwap.value)}`
    );
    console.log(
      `> sourceSwap expectedAmount: ${formatEther(sourceSwap.value)}`
    );
    console.log(`>         sourceSwap expiry: ${sourceSwap.endTimeStamp}`);
    console.log(`>   sourceSwap hashedSecret: ${sourceSwap.hashedSecret}`);

    console.log(`> revealing commitment ${sourceId} on source chain`);

    const claimResponse = await sourceContract.claim(sourceId, proof);

    const claimReceipt = await claimResponse.wait();

    if (claimReceipt.status === 1) {
      console.log(
        "> commitment was revealed on source chain",
        claimReceipt.transactionHash
      );
      console.log(
        `> received ${formatEther(
          sourceSwap.value
        )} ETH from swap with initiator ${sourceSwap.initiator}`
      );
    }

    if (claimReceipt.status === 0) {
      console.log(
        "> commitment reveal failed on source chain",
        claimReceipt.transactionHash
      );
    }
  }

  console.log(`> Trying to claim commitment ${sourceId} end`);
};
