import React, {useCallback, useState} from "react";

import {LabeledInput} from "../labeled-input";
import {Button} from "../button";

import useWeb3Modal from "../../hooks/useWeb3Modal";
import {commit} from "../../utils/eth-swap";
import {useStore} from "../../store";

import {randomBytes} from "@ethersproject/random";
import {hexlify} from "@ethersproject/bytes";
import {keccak256} from "@ethersproject/keccak256";
import {ZERO_ADDRESS} from "../../config";

function CommitBoxEthPow() {
    const [recipientETHAddress, setRecipientETHAddress] = React.useState("");
    // const [hashedSecret, setHashedSecret] = React.useState("");
    const [claimPeriodInSec, setClaimPeriodInSec] = React.useState("");
    const [isCommitting, setIsCommitting] = React.useState(false);
    const [commitTxHash, setCommitTxHash] = React.useState("");
    // const [tlCommitment, setTlCommitment] = React.useState<null | ICommitment>(null)
    const [stateSecret, setStateSecret] = useState("")
    const [shareLink, setShareLink] = React.useState("");
    const {provider} = useWeb3Modal({autoLoad: true});
    const handleClickCopy = async () => {
        await navigator.clipboard.writeText(shareLink);
    };

    const connectedETHAddress = useStore((state) => state.connectedETHAddress);

    // const getTlCommitment = async (hashedSecret:string) => {
    //   // const commitment = await getCommitment(hashedSecret)
    //   // setTlCommitment(commitment)
    // }

    // React.useEffect(() => {
    //   const url = new URL(window.location.href);
    //
    //   const hashedSecret = url.searchParams.get("hashed-secret");
    //   if (hashedSecret) {
    //     setHashedSecret(hashedSecret);
    //
    //     getTlCommitment(hashedSecret)
    //   }
    //
    //   const recipientETHAddress = url.searchParams.get("eth-address");
    //   if (recipientETHAddress) {
    //     setRecipientETHAddress(recipientETHAddress);
    //   }
    //
    // }, []);

    const handleClickCommit = async () => {
        try {
            setIsCommitting(true);


            console.log('provider', provider)
            if (!provider) {
                throw new Error("No wallet connected");
            }

            // if (!hashedSecret) {
            //   throw new Error("Invalid hashed secret provided");
            // }

            // if (!recipientETHAddress) {
            //   throw new Error("Invalid initiator address provided");
            // }

            if (!claimPeriodInSec) {
                throw new Error("Invalid claim period provided");
            }

            if (!claimPeriodInSec) {
                throw new Error("Invalid claim period provided");
            }

            // const commitment = tlCommitment

            const secret = hexlify(randomBytes(32));
            const hashedSecret = keccak256(secret);


            const requestedEthAmount = String(ethPoWAmount);

            const txResponse = await commit(
                {
                    claimPeriodInSec,
                    hashedSecret,
                    initiatorEthAddress: connectedETHAddress as string,
                    lockedEthAmount: ethPoSAmount,
                    expectedAmount: requestedEthAmount,
                    recipient: ZERO_ADDRESS
                },
                provider.getSigner()
            );
            const txReceipt = await txResponse.wait();
            setCommitTxHash(txReceipt.transactionHash);
            setClaimPeriodInSec("");
            // setRecipientETHAddress("");

            // const localCommitment = await getCommitment(hashedSecret)

            setStateSecret(secret)


            const shareLink = `${process.env.PUBLIC_URL}/commit?hashed-secret=${hashedSecret}`;
            setShareLink(shareLink);

            // setHashedSecret("");


        } catch (error) {
            console.log(error);
        } finally {
            setIsCommitting(false);
        }
    };

    const [ethPoSAmount, setPoSAmount] = useState("0")
    const [ethPoWAmount, setPoWAmount] = useState("0")
    // const [claimPeriod, setClaimPeriod] = useState("0")

    return (
        <>
            <LabeledInput
                id="tlAmount"
                label="PoW Eth to sell"
                value={ethPoSAmount}
                onChangeInputValue={setPoSAmount}
                type="number"
                min={0}
            />
            <LabeledInput
                id="ethAmount"
                label="PoS Eth to receive"
                value={ethPoWAmount}
                onChangeInputValue={setPoWAmount}
                type="number"
                min={0}
            />
            <LabeledInput
                id="claimPeriod"
                label="Claim Period (sec)"
                value={claimPeriodInSec}
                onChangeInputValue={setClaimPeriodInSec}
                type="number"
                min={0}
            />
            <div className="flex flex-row gap-x-2 w-full">
                <Button buttonType="primary"
                        onClick={handleClickCommit}
                        fullWidth>
                    Commit
                </Button>
            </div>

            {commitTxHash && (
                <>
                    <div className="mt-4 text-center break-words" style={{wordBreak: "break-word"}}>
                        Write down your secret: <strong>{stateSecret}</strong>. You'll need it when you want to claim your Eth.
                    </div>
                    <>
                        <div className="text-xs" style={{wordBreak: "break-word"}}>
                            The tx was signed. You can give the following link to the counterparty. <br/>
                            {shareLink}
                        </div>
                    </>
                    <Button buttonType="primary" onClick={handleClickCopy} fullWidth>
                        Copy Link
                    </Button>
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

                </>
            )}
        </>
    );
}

export {CommitBoxEthPow};
