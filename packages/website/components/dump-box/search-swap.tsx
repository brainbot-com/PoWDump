import {useWeb3React} from '@web3-react/core'
import {Web3Provider} from '@ethersproject/providers'
import React, {useEffect, useState} from 'react'
import {keccak256} from '@ethersproject/keccak256'
import {gql, request} from 'graphql-request'
import {parseEther, parseUnits} from 'ethers/lib/utils'
import {getPoSSwapContract} from '../../utils/swapContract'
import {switchChain} from '../../utils/switchChain'
import {SupportedChainId} from '../../constants/chains'
import type {Block} from "@ethersproject/abstract-provider";
import config from "../../config";

const posQuery = gql`
    query getSwap($recipient: String!, $hashedSecret: String!, $initiator: String!) {
        swapCommitments(where: { recipient: $recipient, hashedSecret: $hashedSecret, initiator: $initiator }) {
            id
            endTimeStamp
            expectedAmount
            hashedSecret
            recipient
            proof
            initiator
            refunded
            value
        }
    }
`

type Props = {
    recipient: string,
    initiator: string,
    secret: string,
    expectedPoSAmount: string,
}
type SwapType = {
    id: string,
    value: string,
}
export const SearchSwap = ({recipient, initiator, secret, expectedPoSAmount}: Props) => {
    const {account, connector, provider, chainId} = useWeb3React<Web3Provider>()
    const [foundSwap, setFoundSwap] = useState<undefined | SwapType>(undefined)
    console.log('provider', provider, connector, chainId)
    const hashedSecret = keccak256(secret)
    useEffect(() => {
        if (provider) {
            const onBlockListener = async (blockNumber: Block) => {
                const data = await request(config.SUBGRAPH_POS_URL, posQuery, {
                    recipient: String(recipient),
                    hashedSecret: String(hashedSecret),
                    initiator: String(initiator),
                })


                if (data) {
                    const {swapCommitments} = data

                    if (swapCommitments.length === 1) {
                        const {id, value} = swapCommitments[0]

                        if (parseUnits(value, 'wei').eq(parseEther(expectedPoSAmount))) {
                            console.log('swaps appear to have same values')

                            setFoundSwap(swapCommitments[0])
                        }
                    }
                }
            }

            if (foundSwap) {
                provider.removeListener('block', onBlockListener)
            } else {
                provider.on('block', onBlockListener)
            }
        }
    }, [provider, foundSwap])

    if (foundSwap) {
        return (
            <div>
                Found swap with id: {foundSwap.id} and value: {foundSwap.value}
                Reveal secret on Pos chain to claim funds.
                {chainId === SupportedChainId.LOCAL_POW && (
                    <>
                        You need to switch to the Pos chain to reveal the secret.
                        <button
                            onClick={async () => {
                                // TODO: switch properly (also the UI)
                                try {
                                    await switchChain(connector, SupportedChainId.LOCAL_POS)
                                } catch (e) {
                                    console.log('You need to switch the chain', e)
                                }

                            }}
                        >
                            Switch Chain
                        </button>
                    </>
                )}
                {chainId === SupportedChainId.LOCAL_POS && (
                    <>
                        <button
                            onClick={async () => {


                                try {
                                    const signer = provider?.getSigner()
                                    if (signer) {
                                        const contract = getPoSSwapContract(signer)
                                        await contract.claim(foundSwap.id, secret)
                                    }
                                } catch (e) {
                                    console.log('Something went wrong when signing', e)
                                }
                            }}
                        >
                            Reveal secret
                        </button>
                    </>
                )}
            </div>
        )
    }
    return <div>no swap found yet.</div>
}
