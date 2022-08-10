import React from "react";

import { LabeledInput } from "../labeled-input";
import { ConnectETHWalletButton } from "../connect-eth-wallet-button";
import { Button } from "../button";

import useWeb3Modal from "../../hooks/useWeb3Modal";
// import { getCommitment } from "../../utils/tl-swap";
import { commit } from "../../utils/eth-swap";
import { useStore } from "../../store";
import {ICommitment} from "../../api/types";
import {ZERO_ADDRESS} from "../../config";
import {formatEther} from "@ethersproject/units";

const commitmentExist = (commitment:ICommitment) => {
  if(commitment.initiator !== ZERO_ADDRESS) {
    return true
  }

  return false
}
function CommitBoxEthToTl() {
  const [recipientETHAddress, setRecipientETHAddress] = React.useState("");
  const [hashedSecret, setHashedSecret] = React.useState("");
  const [claimPeriodInSec, setClaimPeriodInSec] = React.useState("");
  const [isCommitting, setIsCommitting] = React.useState(false);
  const [commitTxHash, setCommitTxHash] = React.useState("");
  const [tlCommitment, setTlCommitment] = React.useState<null | ICommitment>(null)

  const { provider } = useWeb3Modal({ autoLoad: true });

  const connectedETHAddress = useStore((state) => state.connectedETHAddress);

  const getTlCommitment = async (hashedSecret:string) => {
    // const commitment = await getCommitment(hashedSecret)
    // setTlCommitment(commitment)
  }

  React.useEffect(() => {
    const url = new URL(window.location.href);

    const hashedSecret = url.searchParams.get("hashed-secret");
    if (hashedSecret) {
      setHashedSecret(hashedSecret);

      getTlCommitment(hashedSecret)
    }

    const recipientETHAddress = url.searchParams.get("eth-address");
    if (recipientETHAddress) {
      setRecipientETHAddress(recipientETHAddress);
    }

  }, []);

  const handleClickCommit = async () => {
    try {
      setIsCommitting(true);

      if (!provider) {
        throw new Error("No wallet connected");
      }

      if (!hashedSecret) {
        throw new Error("Invalid hashed secret provided");
      }

      if (!recipientETHAddress) {
        throw new Error("Invalid initiator address provided");
      }

      if (!claimPeriodInSec) {
        throw new Error("Invalid claim period provided");
      }

      const commitment = tlCommitment

      if(commitment !== null) {
        const requestedEthAmount = String(commitment.EthAmount);

        const txResponse = await commit(
            {
              claimPeriodInSec,
              hashedSecret,
              initiatorEthAddress: recipientETHAddress,
              requestedEthAmount,
            },
            provider.getSigner()
        );
        const txReceipt = await txResponse.wait();
        setCommitTxHash(txReceipt.transactionHash);
        setClaimPeriodInSec("");
        setRecipientETHAddress("");
        setHashedSecret("");
      }


    } catch (error) {
      console.log(error);
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <>
      <LabeledInput
        id="hashedSecretInput"
        label="Hashed Secret"
        value={hashedSecret}
        onChangeInputValue={setHashedSecret}
      />
      {tlCommitment && (commitmentExist(tlCommitment)) ? (
        <div>
          We fetched following commitment in the TL contract:
          <div>
            TL initiator: {tlCommitment.initiator} <br />
            TL recipient: {tlCommitment.recipient}<br />
            TL pay amount: {String(tlCommitment.TLMoneyAmount)} ({tlCommitment.TLNetwork})<br />
            Offer valid till: {String(tlCommitment.endTimeStamp)}<br />
            Recipient ETH Address: {recipientETHAddress}<br />

            Requested Eth Amount: {formatEther(tlCommitment.EthAmount)}
          </div>


          <LabeledInput
              id="claimPeriod"
              label="Claim Period (sec)"
              value={claimPeriodInSec}
              onChangeInputValue={setClaimPeriodInSec}
              type="number"
              min={0}
          />
          {connectedETHAddress ? (
              <>
                <div>
                  If you want to match this offer click the commit button bellow:
                </div>
                <Button
                    buttonType="primary"
                    onClick={handleClickCommit}
                    disabled={isCommitting}
                    fullWidth
                >
                  {isCommitting ? "Committing..." : "Commit"}
                </Button>
              </>
          ) : (
              <ConnectETHWalletButton />
          )}
        </div>
      ) : (
          <div>
            We cannot find a commitment with this hash.
          </div>
      )

      }


      {commitTxHash && (
        <div className="bg-green-100 p-4 text-green-700 w-full text-center">
          Successfully committed!{" "}
          <a
            className="underline"
            href={`https://goerli.etherscan.io/tx/${commitTxHash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Etherscan
          </a>
        </div>
      )}
    </>
  );
}

export { CommitBoxEthToTl };
