import React, {useState, Fragment} from "react";

import {ClaimBoxSwitchButtonBar} from "../claim-box-switch-button-bar";
import {ClaimBoxEth} from "../claim-box-eth";

import {useStore} from "../../store";
import {CommitBoxEthPow} from "../commit-box-eth-pow";
import {CommitBoxEthToTl} from "../commit-box-eth-to-tl";
import {LabeledInput} from "../labeled-input";
import {Button} from "../button";
import useWeb3Modal from "../../hooks/useWeb3Modal";
import {hexlify} from "@ethersproject/bytes";
import {randomBytes} from "@ethersproject/random";
import {keccak256} from "@ethersproject/keccak256";
import {commit} from "../../utils/eth-swap";
import {ZERO_ADDRESS} from "../../config";
import {Popover, Transition} from '@headlessui/react'
import {ChevronDownIcon, CogIcon} from '@heroicons/react/solid'
import {classNames} from "../../utils/tailwind";

type Props = {
    onSettingUpdate: (setting: string, value: string) => void
}

function Settings({onSettingUpdate}: Props) {
    const [offerValidFor, setOfferValidFor] = useState("");
    return (
        <Popover className="relative">
            {({open}) => (
                <>
                    <Popover.Button
                        className={classNames(
                            // open ? 'text-gray-900' : 'text-gray-500',
                            'group inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none ',
                            'focus:ring-0 focus:ring-offset-0 focus:ring-indigo-500'
                        )}
                    >
                        <CogIcon
                            className={classNames(open ? 'text-gray-600' : 'text-gray-400',
                                'ml-2 h-5 w-5 group-hover:text-gray-500')}
                            aria-hidden="true"
                        />
                    </Popover.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel
                            className="absolute z-10 left-7 transform -translate-x-full mt-3 px-2 w-screen max-w-[220px] sm:px-0">
                            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                                <div
                                    className="relative dark:bg-zinc-800 px-2 py-6 sm:gap-2 sm:p-4
                                    text-zinc-400
                                    border border-zinc-700 rounded rounded-lg">
                                    Dump offer valid for:
                                    <div>
                                        <input
                                            className={"dark:bg-zinc-800 border border-zinc-700 rounded rounded-lg w-1/3 mr-2 px-2 text-right"}
                                            type={"text"}
                                            placeholder={"10"}
                                            onChange={(e) => {
                                                setOfferValidFor(e.target.value)
                                                onSettingUpdate("dumpOfferValidFor", e.target.value)
                                            }}
                                            value={offerValidFor}
                                        />
                                        minutes
                                    </div>


                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}

function InputRow(props) {
    return (
        <div className="w-full">
            <div className="flex flex-col rounded-lg dark:bg-zinc-800 pt-2">
                <div className="flex flex-row mt-2">
                    <div className={"flex-1 items-center p-2"}>
                        <input
                            className="w-full appearance-none outline-none dark:bg-zinc-800 text-2xl"
                            type={props.type}
                            id={props.id}
                            value={props.value}
                            onChange={(event) => props.onChangeInputValue(event.target.value)}
                            placeholder={props.placeholder}
                        />
                    </div>

                    {props.append && (
                        <div className={"justify-center items-center flex mr-3 p-1"}>
                            <span className={"bg-zinc-700 rounded rounded-lg px-2 py-1"}>

                            {props.append}
                            </span>
                        </div>)}

                </div>
                <div className={"error"}>
                    &nbsp;
                </div>
            </div>
        </div>
    );
}

function DumpBox() {
    const [recipientETHAddress, setRecipientETHAddress] = React.useState("");
    // const [hashedSecret, setHashedSecret] = React.useState("");
    const [claimPeriodInSec, setClaimPeriodInSec] = React.useState<string | number>("");
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

    const [ethPoSAmount, setPoSAmount] = useState("")
    const [ethPoWAmount, setPoWAmount] = useState("")

    return (
        <div className="container mx-auto">
            <div
                className="
          max-w-md mx-auto flex flex-col items-center mt-10 rounded-lg
           p-4 shadow-md gap-y-4 dark:bg-zinc-900 text-white dark:text-gray-500
        "
            >
                <div className={"flex flex-row w-full items-center"}>
                    <div className="text-white text-xl flex-1">
                        Dump
                    </div>
                    <Settings onSettingUpdate={(setting, value) => {
                        if (setting === "dumpOfferValidFor") {
                            setClaimPeriodInSec(+value * 60);
                        }
                    }} dumpOfferValidFor={claimPeriodInSec}/>
                </div>
                {/*<CommitBoxSwitchButtonBar />*/}
                {/*{activeCommitBoxSwitchItem === "ethPoW" ? (*/}
                {/*    <CommitBoxEthPow/>*/}
                {/*) : (*/}
                {/*    <CommitBoxEthToTl/>*/}
                {/*)}*/}

                <InputRow
                    id="tlAmount"
                    label="PoW Eth to sell"
                    value={ethPoSAmount}
                    onChangeInputValue={setPoSAmount}
                    type="text"
                    placeholder="0.0"
                    append={"ethPoW"}
                />
                <InputRow
                    id="ethAmount"
                    label="PoS Eth to receive"
                    value={ethPoWAmount}
                    onChangeInputValue={setPoWAmount}
                    type="text"
                    placeholder="0.0"
                    append={"ethPoS"}
                />
                {/*<LabeledInput*/}
                {/*    id="claimPeriod"*/}
                {/*    label="Claim Period (sec)"*/}
                {/*    value={claimPeriodInSec}*/}
                {/*    onChangeInputValue={setClaimPeriodInSec}*/}
                {/*    type="number"*/}
                {/*    min={0}*/}
                {/*/>*/}
                <div className="flex flex-row gap-x-2 w-full">
                    <Button buttonType="primary"
                            onClick={handleClickCommit}
                            fullWidth>
                        Dump now!
                    </Button>
                </div>

                {commitTxHash && (
                    <>
                        <div className="mt-4 text-center break-words" style={{wordBreak: "break-word"}}>
                            Write down your secret: <strong>{stateSecret}</strong>. You'll need it when you want to
                            claim your Eth.
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
            </div>
        </div>
    );
}

export {DumpBox};
