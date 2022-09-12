import React from 'react'

import { useStore } from '../../store'
import { Settings } from './dump-settings'
import { DumpBoxLayout } from './dump-box-layout'
import { DealStatus } from './deal-status'
import { DetectNonCompleteSwaps } from '../detect-swaps'
import { DumpForm } from './dump-form'

function DumpBox() {
  const processingCommitment = useStore(state => state.processingCommitment)

  if (processingCommitment) {
    return <DealStatus />
  }

  return (
    <DumpBoxLayout
      message={
        <p className={'text-center mt-10 font-medium'}>
          This DApp allows you to dump your Pow Eth that you have on the Proof-of-Work Ethereum chain (aka the fork) for
          ETH on the canonical Proof-of-Stake Ethereum chain.
        </p>
      }
    >
      <div className={'flex flex-row w-full items-center'}>
        <div className="text-white text-xl flex-1">Dump PoW ETH for ETH</div>
        <Settings />
      </div>

      <DetectNonCompleteSwaps />
      <DumpForm />
    </DumpBoxLayout>
  )
}

export { DumpBox }
