import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {useState} from "react";
import {useStore} from "../../store";
import {classNames} from "../../utils/tailwind";
import {ZERO_ADDRESS} from "../../config";

export const HowItWorks = () => {
    const {account} = useWeb3React<Web3Provider>()
    const form = useStore(state => state.form)
    const processingCommitment = useStore(state => state.processingCommitment)
    const steps = [
        {
            message: ' Connect your wallet and select the PoW Ethereum chain.', isAtStep: () => {
                return !account
            }
        },
        {
            message: 'Decide on the amount of PoW ETH you want to sell and the minimum price.', isAtStep: () => {
                return account && !form.ethPoWAmount && !processingCommitment && !form.complete
            }
        },
        {
            message: 'Sign a transaction for the dump on the PoW Ethereum chain.', isAtStep: () => {
                return form.ethPoWAmount && !form.signed && !form.complete
            }
        },
        {
            message: 'Wait for someone to match your transaction or for it to expire.', isAtStep: () => {
                return processingCommitment && form.signed && !form.complete
            }
        },
        {
            message: 'Depending on what happens in the previous step:', isAtStep: () => {
                return false
            },
            childrenSteps: [
                {
                    message: '> Dump matched on PoS? You need to confirm on the PoS chain fast.', isAtStep: () => {
                        return processingCommitment && processingCommitment.recipient !== ZERO_ADDRESS && !form.complete
                    }
                },
                {
                    message: '> If your transaction expires, you can reclaim your PoW ETH from the contract & retry.', isAtStep: () => {
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