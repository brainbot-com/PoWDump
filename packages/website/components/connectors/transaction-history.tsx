import { gql, request } from 'graphql-request'
import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useState } from 'react'
import { SubgraphCommitment, useStore } from '../../store'
import { getChainInfo } from '../../constants/chainInfo'
import config from '../../config'
import { Status } from '../dump-box'
import { compareAsc, format, fromUnixTime } from 'date-fns'
import { formatEther } from 'ethers/lib/utils'
import { Loader } from '../dump-box/loader'
import { Button } from '../button'
import { refund } from '../../utils/eth-swap'
import { getErrorMessage } from '../../utils/error'

const query = gql`
  query getCommitment($initiator: String!) {
    swapCommitments(initiator: $initiator, orderBy: endTimeStamp, orderDirection: desc) {
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

export const TransactionHistory = () => {
  const { provider, account, chainId } = useWeb3React()
  const [swaps, setSwaps] = useState<SubgraphCommitment[]>([])
  const chainInfo = getChainInfo(chainId)
  const now = new Date()
  const setNotification = useStore(state => state.setNotification)
  const [isSubmitting, setIsSubmitting] = useState<{ [swapId: string]: boolean }>({})
  const [refundHashes, setRefundHash] = useState<{ [swapId: string]: string }>({})
  const [success, setSuccess] = useState<{ [swapId: string]: boolean }>({})
  const [refundedSwaps, setRefundedSwaps] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (!account || !chainId) {
      return
    }
    const getData = async () => {
      const data = await request(config.SUBGRAPH_POW_URLS[chainId], query, { initiator: String(account) })

      if (data) {
        const { swapCommitments } = data

        return swapCommitments
      }
    }

    getData().then(data => {
      setSwaps(data)
    })
  }, [account, chainId])

  const title = <div className={'font-bold text-xl'}>Transaction history</div>
  if (swaps.length === 0) {
    return (
      <div>
        {title}
        <div>{"Your haven't made any trades on this chain"}</div>
      </div>
    )
  }

  const StatusWithBackground = ({ status }: { status: string }) => {
    return (
      <div className={'bg-yellow text-black rounded-md p-1 pb-5 mb-2'}>
        <Status status={status} />
      </div>
    )
  }
  return (
    <div>
      {title}

      {swaps.map(swap => {
        const hasExpired = compareAsc(fromUnixTime(parseInt(swap.endTimeStamp)), now) <= 0
        const isRefunded = swap.refunded && hasExpired

        return (
          <div
            key={`swap-id-${swap.id}`}
            className={' flex flex-col border rounded-md mt-3 py-2 p-5 bg-brown-orange text-white'}
          >
            <div className={'flex-1'}>
              {isSubmitting[swap.id] && refundHashes[swap.id] === '' && (
                <StatusWithBackground status={'Waiting for confirmation in wallet'} />
              )}

              {isSubmitting[swap.id] && refundHashes[swap.id] !== '' && (
                <StatusWithBackground status={'Waiting for the refund transaction to be mined'} />
              )}

              {success[swap.id] && (
                <>
                  <StatusWithBackground status={'Refund transaction mined'} />
                </>
              )}

              <div>
                <span className={'font-bold'}>Swap ID</span>: {swap.id}
              </div>
              <div>
                <span className={'font-bold'}>{chainInfo && chainInfo.nativeCurrency.symbol} locked:</span>{' '}
                {formatEther(swap.value)}
              </div>
              <div>
                <span className={'font-bold'}>Has ended:</span> {hasExpired ? 'Yes' : 'No'}
              </div>
              {hasExpired && (
                <div>
                  <span className={'font-bold'}>Trade ended on:</span>{' '}
                  {format(fromUnixTime(parseInt(swap.endTimeStamp)), 'dd.MM.yyyy hh:mm:ss')}
                </div>
              )}
              <div>
                <span className={'font-bold'}>Emptied by counterparty:</span> {swap.emptied ? 'Yes' : 'No'}
              </div>
              <div>
                <span className={'font-bold'}>Refunded:</span> {swap.refunded ? 'Yes' : 'No'}
              </div>
            </div>
            <div className={'flex items-center justify-center mt-3 mb-3'}>
              {isSubmitting[swap.id] || (refundHashes[swap.id] && !success[swap.id]) ? (
                <Loader />
              ) : (
                !isRefunded &&
                !refundedSwaps[swap.id] && (
                  <Button
                    buttonType={'primary'}
                    className={'text-xs'}
                    onClick={async () => {
                      setIsSubmitting({ ...isSubmitting, [swap.id]: true })
                      try {
                        const signer = provider?.getSigner()

                        if (!signer) {
                          throw new Error('No signer found')
                        }
                        const txResponse = await refund(String(swap.id), signer)
                        setRefundHash({ ...refundHashes, [swap.id]: txResponse.hash })
                        const receipt = await txResponse.wait()

                        if (receipt.status === 1) {
                          setSuccess({ ...success, [swap.id]: true })
                          setRefundedSwaps({ ...refundedSwaps, [swap.id]: true })
                        }

                        if (receipt.status === 0) {
                          setSuccess({ ...success, [swap.id]: false })

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
                        setIsSubmitting({ ...isSubmitting, [swap.id]: false })
                      }
                    }}
                  >
                    Reclaim funds
                  </Button>
                )
              )}
              {}
            </div>
          </div>
        )
      })}
    </div>
  )
}
