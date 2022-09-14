import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {useStore} from "../../store";
import React, {useState} from "react";
import {DumpBoxLayout} from "./dump-box-layout";
import {Status} from "./status";
import {NewDump} from "./new-dump";
import {ExclamationTriangleIcon} from "@heroicons/react/24/outline";
import {Button} from "../button";
import {refund} from "../../utils/eth-swap";
import {getErrorMessage} from "../../utils/error";
import {SwapMetaRow} from "./swap-meta-row";
import config from "../../config";

type Props = {
    swapId: string
    commitTxHash: string
}
export const ExpiredSwap = ({swapId, commitTxHash}: Props) => {
    const { provider, chainId} = useWeb3React<Web3Provider>()
    const setNotification = useStore(state => state.setNotification)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [refundHash, setRefundHash] = useState('')
    const [success, setSuccess] = useState(false)

    return (
        <DumpBoxLayout style={'in-progress'}>
            {isSubmitting && refundHash === '' && <Status status={'Waiting for confirmation in wallet'}/>}

            {isSubmitting && refundHash !== '' && <Status status={'Waiting for the refund transaction to be mined'}/>}

            {success && (
                <>
                    <Status status={'Refund transaction mined'}/>
                    <NewDump message={'Want to try a new dump?'}/>
                </>
            )}

            {refundHash === '' && (
                <div className={'bg-yellow text-black rounded-md p-2 flex flex-col'}>
                    <div className={'flex'}>
                        <ExclamationTriangleIcon className={'w-25 mx-3'}/>
                        Unfortunately no-one matched your trade offer. You can claim back your funds from the contract
                        and make a
                        new trade offer afterwards.
                    </div>

                    {chainId === config.POS_CHAIN_ID ? (
                        <div className={'mt-5 flex flex-col items-center'}>
                            <div className={'text-sm font-bold'}>Please switch to the eth PoW chain to start the
                                refund.
                            </div>
                        </div>
                    ) : (
                        <div className={'flex flex-row items-center justify-center mt-2'}>
                            <Button
                                buttonType={'primary'}
                                onClick={async () => {
                                    setIsSubmitting(true)
                                    try {
                                        const signer = provider?.getSigner()

                                        if(!signer) {
                                            throw new Error("No signer found")
                                        }
                                        const txResponse = await refund(String(swapId), signer)
                                        setRefundHash(txResponse.hash)
                                        const receipt = await txResponse.wait()

                                        if (receipt.status === 1) {
                                            setSuccess(true)
                                        }

                                        if (receipt.status === 0) {
                                            setSuccess(false)
                                            setNotification({
                                                title: 'Refund failed',
                                                description: 'Transaction failed.',
                                                type: 'error',
                                            })
                                        }
                                    } catch (e) {
                                        console.log('error', e)
                                        setNotification({
                                            description: getErrorMessage(e),
                                            title: 'Error',
                                            type: 'error',
                                        })
                                    } finally {
                                        setIsSubmitting(false)
                                    }
                                }}
                            >
                                Claim funds back
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <SwapMetaRow txHash={commitTxHash} swapId={swapId}/>
        </DumpBoxLayout>
    )
}