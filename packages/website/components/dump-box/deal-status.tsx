import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { DumpBoxLayout } from './dump-box-layout'
import { Deal } from './deal'
import { Status } from './status'
// @ts-ignore
import LoaderSvg from '../../public/assets/tail-spin.svg'
import { formatAddress } from '../../utils/helpers'
import { CopyToClipboard } from './copy-to-clipboard'
import React, { useState } from 'react'
import { useStore } from '../../store'
import { compareAsc, fromUnixTime } from 'date-fns'
import Countdown from 'react-countdown'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { config } from '../../config'
import { useInterval } from '../../hooks/use-interval'
import { Button } from '../button'
import { getPoSSwapContract } from '../../utils/swapContract'
import { useSearchRecipient } from '../../hooks/use-search-recipient'
import { useSearchSwaps } from '../../hooks/use-search-swaps'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { formatEther } from 'ethers/lib/utils'
import { SwapMetaRow } from './swap-meta-row'
import { ChangeChain } from './change-chain'
import { NewDump } from './new-dump'
import { ExpiredSwap } from './expired-swap'
import type {TransactionReceipt} from "@ethersproject/abstract-provider";

export const DealStatus = () => {
  const { account, provider, chainId } = useWeb3React<Web3Provider>()
  const [revealComplete, setRevealComplete] = useState(false)
  const swapSecrets = useStore(state => state.swapSecrets)
  const processingCommitment = useStore(state => state.processingCommitment)
  const swapId = processingCommitment?.id || null
  const ethPoW = processingCommitment?.value as string
  const ethPoS = processingCommitment?.expectedAmount as string
  const expireTime = processingCommitment?.endTimeStamp ? Number(processingCommitment.endTimeStamp) : null
  const formChainId = useStore(state => state.form.chainId)
  const stateSecret = swapId ? swapSecrets[`${formChainId}_${swapId}`] || null : null
  const isCommitting = useStore(state => state.form.isCommitting)
  const commitTxHash = useStore(state => state.form.txHash)
  const [swapExpired, setSwapExpired] = useState(false)
  const [expiredSwapIds, setExpiredSwapIds] = useState<{ [key: string]: boolean }>({})
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealTxHash, setRevealTxHash] = useState('')
  const [revealTxReceipt, setRevealTxReceipt] = useState<TransactionReceipt | null>(null)
  const updateFormValue = useStore(state => state.updateFormValue)
  const [amountReceived, setAmountReceived] = useState('')

  useSearchRecipient(swapId, revealComplete || swapExpired)
  let targetSwaps = useSearchSwaps(account, stateSecret, ethPoS, revealComplete || swapExpired)
  targetSwaps = targetSwaps.filter(swap => {
    // Make sure that we only show swaps where the swap initiator on PoS is the same as the swap recipient on PoW
    return swap.initiator === processingCommitment?.recipient
  })

  const isOnPoSChain = chainId === config.POS_CHAIN_ID

  useInterval(
    () => {
      if (!swapId) {
        return null
      }
      if (
        processingCommitment?.endTimeStamp &&
        compareAsc(fromUnixTime(parseInt(processingCommitment?.endTimeStamp)), new Date()) < 0
      ) {
        setSwapExpired(true)
      }
    },
    revealComplete || swapExpired ? null : 5000
  )

  const Loader = (
    <div className={'flex flex-row justify-center'}>
      <img src={LoaderSvg} alt="Loader icon" className={'w-12 flex'} />
    </div>
  )

  if (isCommitting && commitTxHash === '') {
    return (
      <DumpBoxLayout style={'in-progress'}>
        <Deal ethPoS={ethPoS} ethPoW={ethPoW} />

        <Status status={'Waiting for confirmation in wallet'} />
      </DumpBoxLayout>
    )
  }

  if (commitTxHash && swapId === null) {
    return (
      <DumpBoxLayout style={'in-progress'}>
        <Deal ethPoS={ethPoS} ethPoW={ethPoW} />
        <Status status={'Waiting for transaction to be mined'} />
        {Loader}

        <SwapMetaRow txHash={commitTxHash} swapId={swapId} />
      </DumpBoxLayout>
    )
  }

  if (revealComplete) {
    let content = null
    if (revealTxReceipt) {
      if (revealTxReceipt.status === 0) {
        content = (
          <p>
            Transaction{' '}
            <span className={'font-bold'}>
              {formatAddress(revealTxHash)}
              <CopyToClipboard text={revealTxHash} />
            </span>{' '}
            failed.
          </p>
        )
      }

      if (revealTxReceipt.status === 1) {
        content = (
          <>
            <Status status={'Swap is complete!'} />
            <div className={'flex flex-row content-center items-center'}>
              <div className={'mx-auto relative'}>
                <div className={'bg-white absolute w-10 h-10 z-0 left-5 top-5 z-0'} style={{ zIndex: -1 }}></div>
                <CheckCircleIcon className="z-10 text-green w-20 h-20 m-0 " aria-hidden="true" />
              </div>
            </div>
            <div>
              Transaction{' '}
              <span className={'font-bold'}>
                {formatAddress(revealTxHash)}
                <CopyToClipboard text={revealTxHash} />
              </span>{' '}
              was confirmed successfully. You received {formatEther(amountReceived)} ETH.
            </div>
          </>
        )
      }
    }

    return (
      <DumpBoxLayout style={'in-progress'}>
        <NewDump message={'Want to do a new dump?'} />
        {content}
      </DumpBoxLayout>
    )
  }

  if (swapExpired && swapId) {
    return <ExpiredSwap swapId={swapId} commitTxHash={String(commitTxHash)} />
  }

  if (swapId !== null && account) {
    return (
      <DumpBoxLayout style={'in-progress'}>
        {!revealComplete && <Deal ethPoS={ethPoS} ethPoW={ethPoW} />}

        <div className={'flex justify-center flex-col items-center'}>
          {targetSwaps.length === 0 && Loader}

          <div>
            <div className={'flex justify-center my-5 text-xl'}>
              <span className={'font-bold'}> Swap expires in:{' ~'}</span>

              {expireTime && (
                <Countdown
                  date={fromUnixTime(expireTime)}
                  // intervalDelay={1000}
                  daysInHours={true}
                  onComplete={() => {
                    setSwapExpired(true)
                  }}
                />
              )}
            </div>

            {!targetSwaps.length && (
              <div className={'bg-yellow text-black rounded-md p-2 flex flex-row'}>
                <ExclamationTriangleIcon className={'w-10 mx-3'} />
                If no-one matches your dump in the the time above, the swap will be cancelled and you can claim your
                funds back from the contract.
              </div>
            )}
          </div>
        </div>

        {!stateSecret && <div>Something went wrong. Your swap secret is missing from localstorage.</div>}

        {targetSwaps.length > 0 && (
          <div className={'flex flex-col justify-center items-center bg-yellow rounded-md p-5'}>
            <div className={'text-xl font-bold flex items-center'}>
              <ExclamationTriangleIcon className={'w-5 mr-2'} />
              Found a match for your swap
            </div>

            {!isOnPoSChain && (
              <div className={'mt-5 flex flex-col items-center'}>
                <div className={'text-sm font-bold mb-5'}>Please switch to the Ethereum chain to complete the swap.</div>
                <ChangeChain chainId={config.POS_CHAIN_ID} />
              </div>
            )}
            <>
              {isOnPoSChain &&
                targetSwaps.map((swap, index) => {
                  const swapDisabled = !!expiredSwapIds[swap.id]
                  return (
                    <div
                      key={index}
                      className={
                        'flex flex-col w-full flex-1 justify-between items-center mt-5 border rounded-md p-2 bg-orange text-black'
                      }
                    >
                      <div>
                        {isRevealing && revealTxHash === '' && (
                          <div className={'flex flex-row bg-gray-500 rounded-md text-white px-4 py-1'}>
                            <ExclamationTriangleIcon className={'w-4'} /> Waiting for transaction to be signed in the wallet
                          </div>
                        )}
                        {isRevealing && revealTxHash !== '' && (
                          <div className={'flex flex-row bg-gray-500 rounded-md text-white px-4 py-1'}>
                            Waiting for transaction to be mined
                          </div>
                        )}
                      </div>
                      <div className={'flex flex-row justify-between w-full items-center'}>
                        <div>
                          <div>Swap number on Ethereum: {swap.id}</div>
                          <div>ETH amount locked in swap: {formatEther(swap.value)}</div>
                          {!swapDisabled && (
                            <div>
                              Expires in: {' ~'}
                              <Countdown
                                date={fromUnixTime(Number(swap.endTimeStamp))}
                                daysInHours={true}
                                onComplete={() => {
                                  setExpiredSwapIds({
                                    ...expiredSwapIds,
                                    [swap.id]: true,
                                  })
                                }}
                                onTick={({ total }) => {
                                  // if there are less than 20s left, chances are very low that the reveal tx will succeed.
                                  // so we disable the button to prevent the user from trying to reveal the secret
                                  if (Math.floor(total / 1000) < 20) {
                                    setExpiredSwapIds({
                                      ...expiredSwapIds,
                                      [swap.id]: true,
                                    })
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {isRevealing || revealTxHash ? (
                          Loader
                        ) : (
                          <Button
                            className={`bg-green rounded-md px-2 py-1 ${!swapDisabled ? '' : 'bg-gray'}`}
                            disabled={swapDisabled}
                            buttonType={'primary'}
                            onClick={async () => {
                              try {
                                setIsRevealing(true)
                                const signer = provider?.getSigner()
                                if (signer) {
                                  const contract = getPoSSwapContract(signer)
                                  const txResponse = await contract.claim(swap.id, stateSecret)

                                  setRevealTxHash(txResponse.hash)
                                  const txReceipt = await txResponse.wait()

                                  if (txReceipt.status === 1) {
                                    setRevealTxReceipt(txReceipt)
                                    setAmountReceived(swap.value)
                                    updateFormValue('complete', true)
                                  }

                                  setRevealComplete(true)
                                  // onRevealEnd()
                                }
                              } catch (e) {
                                console.log('Something went wrong when signing', e)
                              } finally {
                                setIsRevealing(false)
                              }
                            }}
                          >
                            Reveal
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
            </>
          </div>
        )}
        <SwapMetaRow txHash={commitTxHash} swapId={swapId} />
      </DumpBoxLayout>
    )
  }

  return null
}
