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
import {STATUS} from "web3modal/dist/providers/injected";
import {Status} from "./status";
import {formatAddress} from "../../utils/helpers";
import {CopyToClipboard} from "./copy-to-clipboard";
import {useStore} from "../../store";

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
            emptied
        }
    }
`

type Props = {
    recipient: string,
    initiator: string,
    secret: string,
    expectedPoSAmount: string,
    onSwapFound: (swap: SwapType) => void
}
export type SwapType = {
    id: string,
    endTimeStamp: string
    expectedAmount: string
    hashedSecret: string
    recipient: string
    proof: string
    initiator: string
    refunded: boolean
    value: string
}
export const SearchSwap = ({recipient, initiator, secret, expectedPoSAmount, onSwapFound}: Props) => {
    const {provider} = useWeb3React<Web3Provider>()
    const [foundSwap, setFoundSwap] = useState<undefined | SwapType>()
    const [cancelListener, setCancelListener] = useState(false)
    const hashedSecret = keccak256(secret)
    useEffect(() => {
        let onBlockListener: null | ((blockNumber: Block) => void) = null
        if (provider) {
            onBlockListener = async (blockNumber: Block) => {
                const data = await request(config.SUBGRAPH_POS_URL, posQuery, {
                    recipient: String(recipient),
                    hashedSecret: String(hashedSecret),
                    initiator: String(initiator),
                })

                if (data) {
                    const {swapCommitments} = data

                    if (swapCommitments.length === 1) {
                        const {value, emptied} = swapCommitments[0]

                        if (emptied) {
                            setCancelListener(true)
                        }

                        if (parseUnits(value, 'wei').eq((expectedPoSAmount))) {
                            setFoundSwap(swapCommitments[0])
                            onSwapFound(swapCommitments[0])
                        }
                    }
                }
            }

            if (foundSwap || cancelListener) {
                provider.removeListener('block', onBlockListener)
            } else {
                provider.on('block', onBlockListener)
            }
        }

        return () => {
            provider && onBlockListener && provider.removeListener('block', onBlockListener)
        }
    }, [provider, foundSwap, recipient, hashedSecret, initiator, expectedPoSAmount, onSwapFound, cancelListener])

    if (foundSwap) {
        return <Status status={`Swap found.`}/>
    }

    return <Status status={(
        <span>
            Searching for commitment from <span
            className={"font-bold"}>{formatAddress(initiator)}<CopyToClipboard text={initiator}/></span> on the Ethereum
            chain.
        </span>
    )}/>
}
