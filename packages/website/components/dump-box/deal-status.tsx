import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { DumpBoxLayout } from './dump-box-layout'
import { Deal } from './deal'
import { Status } from './status'
// @ts-ignore
import LoaderSvg from '../../public/assets/tail-spin.svg'
import { formatAddress } from '../../utils/helpers'
import { CopyToClipboard } from './copy-to-clipboard'
import { SearchRecipient } from './search-recipient'
import { SearchSwap } from './search-swap'
import React, { useState } from 'react'
import { Reveal } from './reveal'
import { useStore } from '../../store'
import { switchChain } from '../../utils/switchChain'
import { SupportedChainId } from '../../constants/chains'

function NewDump() {
  const setProcessingCommitment = useStore(state => state.setProcessingCommitment)
  const resetForm = useStore(state => state.resetForm)

  const { connector } = useWeb3React<Web3Provider>()
  return (
    <div>
      Want to do a new dump?{' '}
      <button
        onClick={async () => {
          setProcessingCommitment(null)
          resetForm()
          try {
            await switchChain(connector, SupportedChainId.LOCAL_POW)
          } catch (e) {
            console.log('You need to switch the chain', e)
          }
        }}
      >
        click here
      </button>
    </div>
  )
}

export const DealStatus = () => {
  const { account } = useWeb3React<Web3Provider>()
  const [targetSwap, setTargetSwap] = React.useState<any>()
  const [counterparty, setCounterparty] = useState('')
  const [revealComplete, setRevealComplete] = useState(false)
  const swapSecrets = useStore(state => state.swapSecrets)

  const processingCommitment = useStore(state => state.processingCommitment)
  const swapId = processingCommitment?.id || null
  const ethPoW = processingCommitment?.value as string
  const ethPoS = processingCommitment?.expectedAmount as string
  const expireTime = processingCommitment?.endTimeStamp
  const stateSecret = swapId ? swapSecrets[swapId] || null : null
  const isCommitting = useStore(state => state.form.isCommitting)
  const commitTxHash = useStore(state => state.form.txHash)

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
        <img src={LoaderSvg} alt="Loader icon" />

        <div className={'text-sm flex flex-row'}>
          <span className={'font-bold'}>Transaction hash:</span> {formatAddress(commitTxHash, 6)}
          <CopyToClipboard text={commitTxHash} />
        </div>
      </DumpBoxLayout>
    )
  }

  if (swapId !== null && account) {
    return (
      <DumpBoxLayout style={'in-progress'}>
        {!revealComplete && <Deal ethPoS={ethPoS} ethPoW={ethPoW} />}
        {!counterparty && swapId && (
          <>
            <SearchRecipient swapId={swapId} onRecipient={address => setCounterparty(address)} />
            <img src={LoaderSvg} alt="Loader icon" />

            {commitTxHash && (
              <div className={'text-sm flex flex-row'}>
                <span className={'font-bold'}>Transaction hash:</span> {formatAddress(commitTxHash, 6)}
                <CopyToClipboard text={commitTxHash} />
              </div>
            )}
            {swapId && <div className={'text-sm flex flex-row'}>swap id: {swapId}</div>}
          </>
        )}

        {!stateSecret && <div>Something went wrong. Your swap secret is missing from localstorage.</div>}
        {counterparty && !targetSwap && stateSecret && (
          <>
            <SearchSwap
              recipient={account}
              secret={stateSecret}
              initiator={counterparty}
              expectedPoSAmount={ethPoS}
              onSwapFound={swap => setTargetSwap(swap)}
            />

            <img src={LoaderSvg} alt="Loader icon" />

            {commitTxHash && (
              <div className={'text-sm flex flex-row'}>
                <span className={'font-bold'}>Transaction hash:</span> {formatAddress(commitTxHash, 6)}
                <CopyToClipboard text={commitTxHash} />
              </div>
            )}

            {swapId && <div className={'text-sm flex flex-row'}>swap id: {swapId}</div>}
          </>
        )}
        {counterparty && targetSwap && stateSecret && (
          <Reveal swap={targetSwap} secret={stateSecret} onRevealEnd={() => setRevealComplete(true)} />
        )}

        {revealComplete && <NewDump />}
      </DumpBoxLayout>
    )
  }

  return null
}
