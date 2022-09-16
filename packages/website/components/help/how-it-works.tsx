import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {useState} from "react";
import {useStore} from "../../store";
import {classNames} from "../../utils/tailwind";
import {config, ZERO_ADDRESS} from "../../config";

export const HowItWorks = () => {
    const {account, chainId} = useWeb3React<Web3Provider>()
    const form = useStore(state => state.form)
    const processingCommitment = useStore(state => state.processingCommitment)
    const swapSupportedOnChains = config.ENFORCE_SWAP_ON_CHAINS

    const isChainSupported = (!(!chainId || !swapSupportedOnChains.includes(chainId)))
    const steps = [
        {
            message: ' Connect your wallet and select the PoW Ethereum chain.', isAtStep: () => {
                return !account || (!isChainSupported && !processingCommitment)
            }
        },
        {
            message: 'Decide on the amount of PoW ETH you want to sell and the minimum price.', isAtStep: () => {
                return account && !form.ethPoWAmount && !processingCommitment && !form.complete && isChainSupported
            }
        },
        {
            message: 'Sign a transaction for the dump on the PoW chain.', isAtStep: () => {
                return form.ethPoWAmount && !form.signed && !form.complete && isChainSupported
            }
        },
        {
            message: 'Wait for someone to match your transaction or for it to expire.', isAtStep: () => {
                return (processingCommitment && processingCommitment.id && !form.complete) || (processingCommitment && form.signed && !form.complete && isChainSupported)
            }
        },
        {
            message: 'Depending on what happens in the previous step:', isAtStep: () => {
                return false
            },
            childrenSteps: [
                {
                    message: '> Dump matched on PoS? You need to confirm quickly on the PoS chain.', isAtStep: () => {
                        return processingCommitment && processingCommitment.recipient !== ZERO_ADDRESS && !form.complete
                    }
                },
                {
                    message: '> If your transaction expires, you can reclaim your PoW ETH from the contract and retry.', isAtStep: () => {
                        return false
                    }
                }
            ]
        },
        {
            message: 'Live happily ever after on the  PoS chain.', isAtStep: () => {
                return form.complete
            }
        }
    ]

    return (
        <div className={'rounded-md bg-brown-orange p-5'}>
            <h2 className={'text-2xl'}>How it works</h2>

            <div className={'mt-5 p-2 text-sm'}>
                <ol className={'list-decimal'}>
                    {steps.map((step, index) => {
                        return (
                            <li className={classNames(
                                step.isAtStep() ? 'text-green' : 'text-gray-400',
                                "mt-2"
                            )} key={index}>
                                {step.message}

                                {step.childrenSteps && (
                                    <ul>
                                        {step.childrenSteps.map((childStep, index) => {
                                            return (
                                                <li className={classNames(
                                                    childStep.isAtStep() ? 'text-green' : 'text-gray-400',
                                                    "mt-2")} key={index}>
                                                    {childStep.message}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}

                            </li>
                        )
                    })}
                </ol>
            </div>
        </div>
    )
}
