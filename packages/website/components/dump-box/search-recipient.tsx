import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import React, { useEffect, useState } from 'react'
import { gql, request } from 'graphql-request'
import { ZERO_ADDRESS } from '../../config'

const query = gql`
  query getMovie($id: String!) {
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
export const SearchCounterparty = ({ swapId, onRecipient }: { swapId: string; onRecipient: (recipient: string) => void }) => {
  const { account, provider } = useWeb3React<Web3Provider>()
  const [recipient, setRecipient] = useState<string | undefined>(undefined)

  useEffect(() => {
    console.log('provider', provider)
    if (provider) {
      const onBlockListener = async blockNumber => {
        const data = await request('https://localhost/subgraphs/name/pow', query, { id: String(swapId) })

        console.log(data)

        if (data) {
          const { swapCommitment } = data

          if (swapCommitment) {
            if (swapCommitment.recipient !== ZERO_ADDRESS) {
              onRecipient(swapCommitment.recipient)
              setRecipient(swapCommitment.recipient)

              // provider.removeAllListeners('block')
            }
          }
        }
      }

      provider.on('block', onBlockListener)
    }
  }, [provider])

  if (recipient) {
    return <div>Counterparty: {recipient} commited to the swap. Waiting to find their swap on the PoS chain.</div>
  }
  return <div>no counterparty found yet.</div>
}