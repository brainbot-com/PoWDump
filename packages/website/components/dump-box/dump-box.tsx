import React from 'react'

import { useStore } from '../../store'
import { Settings } from './dump-settings'
import { DumpBoxLayout } from './dump-box-layout'
import { DealStatus } from './deal-status'
import { DetectNonCompleteSwaps } from '../detect-swaps'
import { DumpForm } from './dump-form'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { isSwapSupportedOnChain } from '../../utils/helpers'
import { ChangeChain } from './change-chain'
import config from '../../config'
import { getChainInfo } from '../../constants/chainInfo'

function DumpBox() {
  const processingCommitment = useStore(state => state.processingCommitment)
  const { account, chainId } = useWeb3React<Web3Provider>()
  const isAccountConnected = !!account
  const isSwapEnabled = account && chainId && isSwapSupportedOnChain(chainId)

  if (processingCommitment) {
    return <DealStatus />
  }

  return (
    <>
      <DumpBoxLayout
        message={
          <>
            <p className={'text-center mt-10 font-medium'}>
              This DApp allows you to dump your Pow Eth that you have on the Proof-of-Work Ethereum chain (aka the fork)
              for ETH on the canonical Proof-of-Stake Ethereum chain.
            </p>
            {!isAccountConnected && (
              <div
                className={
                  'bg-yellow flex flex-row items-center justify-center flex-1 p-5 text-black rounded-md mt-7 content-center'
                }
              >
                <ExclamationTriangleIcon className={'w-10 mr-2'} />
                Connect your wallet to start
              </div>
            )}
            {!isSwapEnabled && isAccountConnected && (
              <>
                <div className="text-center flex flex-col bg-red-600 p-5 mt-7 rounded-md text-white">
                  <div className={'flex flex-col items-center justify-center'}>
                    <ExclamationTriangleIcon className={'w-20 mr-2'} />
                    Dumping is not supported on the current chain.
                  </div>
                  <div className="flex flex-wrap flex-col mt-5 bg-yellow text-black p-5 rounded-md">
                    {config.ENFORCE_SWAP_ON_CHAINS.map(chainId => {
                      const chainInfo = getChainInfo(chainId)
                      return (
                        <div key={chainId} className={'flex flex-row justify-between mt-5 items-center'}>
                          <div>{chainInfo?.nativeCurrency?.name || chainId}</div>

                          <ChangeChain className={"text-xs"} chainId={chainId} label={"Use chain"}/>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        }
      >
        <div className={'flex flex-row w-full items-center'}>
          <div className="text-white text-xl flex-1">Dump PoW ETH for ETH</div>
          <Settings />
        </div>

        <DetectNonCompleteSwaps />
        <DumpForm />
      </DumpBoxLayout>
    </>
  )
}

export { DumpBox }
