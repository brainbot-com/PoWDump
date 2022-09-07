import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {DumpBoxLayout} from "./dump-box-layout";
import {Deal} from "./deal";
import {Status} from "./status";
// @ts-ignore
import LoaderSvg from "../../public/assets/tail-spin.svg";
import {formatAddress} from "../../utils/helpers";
import {CopyToClipboard} from "./copy-to-clipboard";
import {SearchRecipient} from "./search-recipient";
import {SearchSwap} from "./search-swap";
import React, {useState} from "react";
import {Reveal} from "./reveal";

type Props = {
    ethPoW: string,
    ethPoS: string,
    isCommitting: boolean,
    commitTxHash: string,
    expireTime: string | number,
    swapId: string | null,
    stateSecret: string,
    onRevealComplete: () => void
}
export const DealStatus = ({
                               ethPoW,
                               ethPoS,
                               isCommitting,
                               commitTxHash,
                               expireTime,
                               swapId,
                               stateSecret,
                               onRevealComplete
                           }: Props) => {
    const {account} = useWeb3React<Web3Provider>()
    const [swap, setSwap] = React.useState<any>()
    const [counterparty, setCounterparty] = useState('')
    const [revealComplete, setRevealComplete] = useState(false)

    if (isCommitting && commitTxHash === '') {
        return (
            <DumpBoxLayout style={"in-progress"}>
                <Deal ethPoS={ethPoS} ethPoW={ethPoW}/>

                <Status status={"Waiting for confirmation in wallet"}/>


            </DumpBoxLayout>
        )
    }


    if (commitTxHash && swapId === null) {
        return (
            <DumpBoxLayout style={"in-progress"}>
                <Deal ethPoS={ethPoS} ethPoW={ethPoW}/>
                <Status status={"Waiting for transaction to be mined"}/>
                <img src={LoaderSvg} alt="Loader icon"/>

                <div className={"text-sm flex flex-row"}>
                    <span className={"font-bold"}>Transaction hash:</span> {formatAddress(commitTxHash, 6)}
                    <CopyToClipboard text={commitTxHash}/>
                </div>
            </DumpBoxLayout>
        )
    }

    if (commitTxHash && swapId !== null && account) {
        return (
            <DumpBoxLayout style={"in-progress"}>
                {!revealComplete && <Deal ethPoS={ethPoS} ethPoW={ethPoW}/>}
                {!counterparty && (
                    <>
                        <SearchRecipient swapId={swapId} onRecipient={address => setCounterparty(address)}/>
                        <img src={LoaderSvg} alt="Loader icon"/>

                        <div className={"text-sm flex flex-row"}>
                            <span className={"font-bold"}>Transaction hash:</span> {formatAddress(commitTxHash, 6)}
                            <CopyToClipboard text={commitTxHash}/>
                        </div>
                    </>
                )}
                {counterparty && !swap && (
                    <>
                        <SearchSwap recipient={account} secret={(stateSecret)} initiator={counterparty}
                                    expectedPoSAmount={ethPoS} onSwapFound={(swap) => setSwap(swap)}/>

                        <img src={LoaderSvg} alt="Loader icon"/>

                        <div className={"text-sm flex flex-row"}>
                            <span className={"font-bold"}>Transaction hash:</span> {formatAddress(commitTxHash, 6)}
                            <CopyToClipboard text={commitTxHash}/>
                        </div>
                    </>
                )}
                {counterparty && swap && (
                    <Reveal swap={swap} secret={stateSecret} onRevealEnd={() => setRevealComplete(true)}/>
                )}

                {revealComplete && (<div> Want to do a new dump? <button onClick={() => {
                    onRevealComplete()
                }}>click here</button></div>)}
            </DumpBoxLayout>
        )
    }

    return null
}