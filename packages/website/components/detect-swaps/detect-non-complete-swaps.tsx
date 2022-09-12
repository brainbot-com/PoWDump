import { gql, request } from 'graphql-request'
import { useEffect, useState } from 'react'
import config, { ZERO_ADDRESS } from '../../config'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from 'ethers/lib/utils'
import { SubgraphCommitment, useStore } from '../../store'
import { getCommitLog } from '../../utils/swapContract'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const getNonCompleteSwapsQuery = gql`
  query getNonCompleteSwaps($initiator: String!, $endTimeStamp: Int!) {
    swapCommitments(where: { initiator: $initiator, refunded: false, emptied: false, endTimeStamp_gt: $endTimeStamp }) {
      id
      endTimeStamp
      expectedAmount
      hashedSecret
      initiator
      proof
      recipient
      refunded
      value
      emptied
    }
  }
`

const getMatchingSwapsQuery = gql`
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

export const DetectNonCompleteSwaps = () => {
  const { account, provider } = useWeb3React<Web3Provider>()
  const [nonCompleteSwaps, setNonCompleteSwaps] = useState<SubgraphCommitment[]>([])

  const setProcessingCommitment = useStore(state => state.setProcessingCommitment)
  const txSecrets = useStore(state => state.txSecrets)
  const deleteTxSecrets = useStore(state => state.deleteTxSecrets)
  const swapSecrets = useStore(state => state.swapSecrets)
  const setSwapSecrets = useStore(state => state.setSwapSecrets)

  useEffect(() => {
    const getSwapIdForHashes = async () => {
      if (!provider) {
        return
      }
      // Go over the transaction keys, then fetch receipts for them, find out the swap id from the logs
      // if the receipt status is 1, then remove the txSecret entry and add the swap id to the swapSecrets
      for await (const txHash of Object.keys(txSecrets)) {
        const txReceipt = await provider.waitForTransaction(txHash, 1, 1000 * 60)
        if (txReceipt && txReceipt.status === 1) {
          const log = getCommitLog(txReceipt)

          if (log.name === 'Commit') {
            if (log.args.id) {
              setSwapSecrets(log.args.id, txSecrets[txHash])
            }
          }

          deleteTxSecrets(txHash)
        }

        if (txReceipt && txReceipt.status === 0) {
          deleteTxSecrets(txHash)
        }
      }
    }

    getSwapIdForHashes()
  }, [provider, txSecrets, setSwapSecrets, deleteTxSecrets])



  useEffect(() => {
    if (!account) {
      return
    }
    const getNonCompleteSwaps = async () => {
      const nonComplete = []
      const data = await request(config.SUBGRAPH_POW_URL, getNonCompleteSwapsQuery, {
        initiator: String(account),
        endTimeStamp: Math.floor(Date.now() / 1000),
      })

      if (data) {
        const { swapCommitments } = data

        for await (const swap of swapCommitments) {
          if (swap.recipient === ZERO_ADDRESS) {
            nonComplete.push(swap)
            continue
          }

          const data = await request(config.SUBGRAPH_POS_URL, getMatchingSwapsQuery, {
            recipient: String(account),
            initiator: String(swap.recipient),
            hashedSecret: String(swap.hashedSecret),
          })

          if (data) {
            const { swapCommitments } = data
            if (swapCommitments.length === 1) {
              const swapCommitment = swapCommitments[0]

              if (swapCommitment.emptied === false) {
                nonComplete.push(swap)
                continue
              }

              if (swapCommitment.refunded === false && swapCommitment.emptied === false) {
                nonComplete.push(swap)
                continue
              }
            }
          } else {
            nonComplete.push(swap)
            continue
          }
        }
      }

      return nonComplete
    }

    getNonCompleteSwaps().then(swaps => {
      setNonCompleteSwaps(swaps)
    })
  }, [account, setNonCompleteSwaps])


  if (nonCompleteSwaps.length) {
    return (
      <div className={'border border-1 rounded-md p-5 bg-yellow text-black'}>
        <div className={"flex flex-row"}>
          <div className={"mr-2 flex flex-1 items-center"}>
            <ExclamationTriangleIcon height={20} />
          </div>

          <span className={'font-bold'}>It seems that you have some non-complete swaps.</span>
        </div>

        <div>
          {nonCompleteSwaps.map(swap => {
            if (!swapSecrets[swap.id]) {
              return null
            }
            return (
              <div key={'swap-id-' + swap.id} className={'flex flex-row mt-5'}>
                <div>
                  <div>Swap id: {swap.id} </div>
                  <div>locked: {formatEther(swap.value)} PoW ETH</div>
                  <div>expected: {formatEther(swap.expectedAmount)} Eth</div>
                  <div>expires at: {new Date(Number(swap.endTimeStamp) * 1000).toISOString()}</div>
                </div>

                <div className={'items-center content-center flex-1 flex'}>
                  <button
                    onClick={() => {
                      setProcessingCommitment(swap)
                    }}
                    className={'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm'}
                  >
                    Resume
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}
