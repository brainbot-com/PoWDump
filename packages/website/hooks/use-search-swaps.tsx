import React, {useEffect, useState} from 'react'
import { keccak256 } from '@ethersproject/keccak256'
import { gql, request } from 'graphql-request'
import { parseUnits } from 'ethers/lib/utils'

import config from '../config'

import { SubgraphCommitment, useStore } from '../store'
import { compareAsc, fromUnixTime } from 'date-fns'
import { useInterval } from './use-interval'

const posQuery = gql`
  query getSwap($recipient: String!, $hashedSecret: String!) {
    swapCommitments(where: { recipient: $recipient, hashedSecret: $hashedSecret, refunded: false, emptied: false }) {
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

const defaultDelay = 5000
export const useSearchSwaps = (
  recipient: string | undefined,
  secret: string | null,
  expectedPoSAmount: string,
  cancelQuery: boolean
) => {
  const [delay, setDelay] = useState(defaultDelay)
  const [foundSwaps, setFoundSwaps] = useState<SubgraphCommitment[]>([])

  const getSwaps = async () => {
    if (!recipient || !secret) {
      return
    }
    const hashedSecret = keccak256(secret)
    const data = await request(config.SUBGRAPH_POS_URL, posQuery, {
      recipient: String(recipient),
      hashedSecret: String(hashedSecret),
    })

    if (data) {
      const { swapCommitments } = data

      if (swapCommitments.length > 0) {
        const validCommitments = swapCommitments
          .map((commitment: SubgraphCommitment): SubgraphCommitment | null => {
            const { value, endTimeStamp } = commitment

            // This swap has expired
            if (compareAsc(fromUnixTime(parseInt(endTimeStamp)), new Date()) <= 0) {
              return null
            }

            // Hasn't locked the correct amount
            if (!parseUnits(value, 'wei').eq(expectedPoSAmount)) {
              return null
            }

            return commitment
          })
          .filter(Boolean)

        // If we have some found commitments, no need to look that often on the server
        if (validCommitments.length) {
          setDelay(15000)
        } else {
          setDelay(defaultDelay)
        }

        setFoundSwaps(validCommitments)
      }
    }
  }

  useEffect(() => {
    if(cancelQuery) {
      return
    }

    getSwaps().then(() => {})
  },[recipient, secret, cancelQuery])

  useInterval(
    async () => {
      await getSwaps()
    },
    cancelQuery ? null : delay
  )

  return foundSwaps
}
