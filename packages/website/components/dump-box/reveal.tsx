import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import React, { useState } from 'react'
import { SupportedChainId } from '../../constants/chains'
import { Status } from './status'
import { Button } from '../button'
import { switchChain } from '../../utils/switchChain'
import { getPoSSwapContract } from '../../utils/swapContract'
import { formatAddress } from '../../utils/helpers'
import { CopyToClipboard } from './copy-to-clipboard'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { formatEther } from 'ethers/lib/utils'
import { SwapType } from './search-swap'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { useStore } from '../../store'

type Props = {
  swap: SwapType
  secret: string
  onRevealEnd: () => void
}
export const Reveal = ({ swap, secret, onRevealEnd }: Props) => {
  const { connector, provider, chainId } = useWeb3React<Web3Provider>()
  const [isRevealing, setIsRevealing] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [txReceipt, setTxReceipt] = useState<TransactionReceipt>()
    const updateFormValue = useStore(state => state.updateFormValue)

  let content = null

  if (chainId === SupportedChainId.LOCAL_POW) {
    content = (
      <>
        <Status status={'Swap found! Time to reveal the secret!'} />

        <p className={'mt-5 text-center font-bold'}>
          We found a commitment to match your sell offer. You need to reveal the secret to complete the swap.
        </p>

        <p className={'my-5'}>First you need to switch to the Ethereum chain.</p>

        <Button
          buttonType={'primary'}
          onClick={async () => {
            try {
              await switchChain(connector, SupportedChainId.LOCAL_POS)
            } catch (e) {
              console.log('You need to switch the chain', e)
            }
          }}
        >
          Switch Chain
        </Button>
      </>
    )
  }

  if (chainId === SupportedChainId.LOCAL_POS) {
    content = (
      <>
        <Status status={'Swap found! Time to reveal the secret!'} />

        <p className={'mt-5 text-center font-bold mb-5'}>
          We found a commitment to match your sell offer. You need to reveal the secret to complete the swap.
        </p>

        <Button
          buttonType={'primary'}
          onClick={async () => {
            try {
              setIsRevealing(true)
              const signer = provider?.getSigner()
              if (signer) {
                const contract = getPoSSwapContract(signer)
                const txResponse = await contract.claim(swap.id, secret)

                setTxHash(txResponse.hash)
                const txReceipt = await txResponse.wait()

                if (txReceipt.status === 1) {
                  setTxReceipt(txReceipt)
                    updateFormValue('complete', true)
                }

                onRevealEnd()
              }
            } catch (e) {
              console.log('Something went wrong when signing', e)
            } finally {
              setIsRevealing(false)
            }
          }}
        >
          Reveal secret
        </Button>
      </>
    )

    if (isRevealing && !txHash) {
      content = <p>Waiting for you to sign the transaction in your wallet.</p>
    }

    if (isRevealing && txHash) {
      content = (
        <p>
          Waiting for transaction{' '}
          <span className={'font-bold'}>
            {formatAddress(txHash)}
            <CopyToClipboard text={txHash} />
          </span>{' '}
          to be mined.
        </p>
      )
    }

    if (txReceipt) {
      if (txReceipt.status === 0) {
        content = (
          <p>
            Transaction{' '}
            <span className={'font-bold'}>
              {formatAddress(txHash)}
              <CopyToClipboard text={txHash} />
            </span>{' '}
            failed.
          </p>
        )
      }

      if (txReceipt.status === 1) {
        content = (
          <>
            <Status status={'Swap is complete!'} />
            <div className={'flex flex-row content-center items-center'}>
              <div className={'mx-auto relative'}>
                <div className={'bg-white absolute w-10 h-10 z-0 left-5 top-5 z-0'} style={{ zIndex: -1 }}></div>
                <CheckCircleIcon className="z-10 text-green w-20 h-20 m-0 " aria-hidden="true" />
              </div>
            </div>
            Transaction{' '}
            <span className={'font-bold'}>
              {formatAddress(txHash)}
              <CopyToClipboard text={txHash} />
            </span>{' '}
            was mined successfully. You received {formatEther(swap.value)} ETH.
          </>
        )
      }
    }
  }
  return (
    <div>
      <div className={'text-center mt-5 '}>{content}</div>
    </div>
  )
}
