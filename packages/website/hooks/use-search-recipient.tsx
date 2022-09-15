import React, { useState } from 'react'
import { gql, request } from 'graphql-request'
import { config, ZERO_ADDRESS } from '../config'
import { useStore } from '../store'
import { useInterval } from './use-interval'
import {useWeb3React} from "@web3-react/core";

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
      emptied
      value
    }
  }
`

const defaultDelay = 5000
let lastRecipient = ZERO_ADDRESS
export const useSearchRecipient = (swapId: string | null, cancelQuery: boolean) => {
  const processingCommitment = useStore(state => state.processingCommitment)
  const setProcessingCommitment = useStore(state => state.setProcessingCommitment)
  const chainId = useStore(state => state.form.chainId)
  const [delay, setDelay] = useState(defaultDelay)

  useInterval(
    async () => {
      if (!swapId || !chainId) {
        return
      }

      const data = await request(config.SUBGRAPH_POW_URLS[chainId], query, { id: String(swapId) })

      if (data) {
        const { swapCommitment } = data

        if (swapCommitment) {
          if (swapCommitment.recipient !== lastRecipient && swapCommitment.recipient !== ZERO_ADDRESS) {
            // if we have non-zero recipient, we don't have to poll that often
            setDelay(15000)
          } else {
            setDelay(defaultDelay)
          }

          lastRecipient = swapCommitment.recipient

          if (processingCommitment) {
            setProcessingCommitment({
              ...processingCommitment,
              endTimeStamp: swapCommitment.endTimeStamp,
              recipient: swapCommitment.recipient,
              proof: swapCommitment.proof,
              refunded: swapCommitment.refunded,
              emptied: swapCommitment.emptied,
            })
          }
        }
      }
    },
    cancelQuery ? null : delay
  )
}
