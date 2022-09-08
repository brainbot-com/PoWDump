import { ethers, Signer, Wallet } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import { getConfig } from "./config";

const getCommitmentInTransaction = async (txHash: string) => {
  const config = getConfig();
  const sourceProvider = config.source.provider;

  const receipt = await sourceProvider.getTransactionReceipt(txHash);

  const abi = config.abi;
  let iface = new ethers.utils.Interface(abi);
  let log = iface.parseLog(receipt.logs[0]);
  const { id } = log.args;

  const ethSwapContractOnSource = config.source.contract;

  return {
    id: id,
    swap: await ethSwapContractOnSource.swaps(id)
  };
};

export const matchCommitment = async (
  transactionWithSwapCommitment: string
) => {
  const config = getConfig();

  const swapCommitment = await getCommitmentInTransaction(
    transactionWithSwapCommitment
  );

  const id = swapCommitment.id;
  const {
    initiator,
    recipient,
    value,
    expectedAmount,
    endTimeStamp,
    hashedSecret
  } = swapCommitment.swap;

  const sourceContract = config.source.contract;
  const sourceWallet = config.source.wallet;

  if (AddressZero === recipient) {
    // First add recipient to source commitment

    const changeRecipientResponse = await sourceContract.changeRecipient(
      id,
      sourceWallet.address,
      {
        gasLimit: "1000000"
      }
    );

    const addRecipient = await changeRecipientResponse.wait();

    console.log(
      "recipient was added on source chain",
      addRecipient.transactionHash
    );
  } else if (recipient !== sourceWallet.address) {
    throw new Error(
      "A different address is already set as recipient",
      recipient
    );
  }

  const ethSwapContractOnTarget = config.target.contract;

  const fee = await ethSwapContractOnTarget.feeFromSwapValue(expectedAmount);
  const commitmentOnTargetResponse = await ethSwapContractOnTarget.commit(
    endTimeStamp,
    hashedSecret,
    expectedAmount,
    value,
    initiator,
    {
      value: expectedAmount.add(fee),
      gasLimit: "1000000"
    }
  );

  const commitmentTx = await commitmentOnTargetResponse.wait();

  console.log(
    "commitment was created on target chain",
    commitmentTx.transactionHash
  );
};
