import {useWeb3React} from '@web3-react/core'
import {Web3Provider} from '@ethersproject/providers'
import React, {useEffect, useState} from 'react'
import {gql, request} from 'graphql-request'
import {config, ZERO_ADDRESS} from '../../config'
import type {Block} from "@ethersproject/abstract-provider";
import {Status} from "./status";

const query = gql`
    query getCommitment($id: String!) {
        swapCommitment(id: $id) {
            endTimeStamp
            expectedAmount
            hashedSecret
            id
            initiator
            proof
            recipient
            refunded
            value
        }
    }
`
export const SearchRecipient = ({
                                    swapId,
                                    onRecipient
                                }: { swapId: string; onRecipient: (recipient: string) => void }) => {
    const {provider} = useWeb3React<Web3Provider>()
    const [recipient, setRecipient] = useState<string | undefined>()

    useEffect(() => {
        if (provider) {
            const onBlockListener = async (blockNumber: Block) => {
                const data = await request(config.SUBGRAPH_POW_URL, query, {id: String(swapId)})

                if (data) {
                    const {swapCommitment} = data

                    if (swapCommitment) {
                        if (swapCommitment.recipient !== ZERO_ADDRESS) {
                            onRecipient(swapCommitment.recipient)
                            setRecipient(swapCommitment.recipient)
                        }
                    }
                }
            }

            if (recipient) {
                provider.removeListener('block', onBlockListener)
            } else {
                provider.on('block', onBlockListener)
            }
        }
    }, [provider, recipient, swapId, onRecipient])

    if (recipient) {
        return <Status status={`Counterparty: ${recipient} committed to the swap. Waiting to find their swap on the PoS chain.`} />
    }
    return <Status status={"Searching for counterparty to match the dump"} />
}