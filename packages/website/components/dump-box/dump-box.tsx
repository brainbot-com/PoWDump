import React, { useEffect, useRef, useState } from 'react'

import { useStore } from '../../store'
import { Button } from '../button'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { keccak256 } from '@ethersproject/keccak256'
import { commit } from '../../utils/eth-swap'
import { ZERO_ADDRESS } from '../../config'
import { Settings } from './dump-settings'
import { InputRow } from '../input-row'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { defaultClaimPeriodInSec } from '../../constants'
import { getErrorMessage } from '../../utils/error'
//@ts-ignore
import PowDumpLogo from '../../public/assets/images/POWdump_Horizontal_logo.png'
//@ts-ignore
import PowDumpSmallLogo from '../../public/assets/images/powdump_dapp_small_pow.png'
//@ts-ignore
import EthereumLogo from '../../public/assets/images/ethereum-logo.png'
import { CurrencyBadge } from './currency-badge'
import { DumpBoxLayout } from './dump-box-layout'
import { DealStatus } from './deal-status'
import { switchChain } from '../../utils/switchChain'
import { SupportedChainId } from '../../constants/chains'
import dynamic from 'next/dynamic'
import { commify, formatEther, formatUnits, parseEther } from 'ethers/lib/utils'
import { BigNumber } from '@ethersproject/bignumber'

// import { BigNumber } from 'bignumber.js'
// import {BigNumber} from "@ethersproject/bignumber";

const PriceRow = dynamic(() => import('./price-row'), {
  ssr: false,
})

const NO_WALLET_CONNECTED = 'NO_WALLET_CONNECTED'
const NO_POW_AMOUNT_ENTERED = 'NO_POW_AMOUNT_ENTERED'
const NO_POS_AMOUNT_ENTERED = 'NO_POS_AMOUNT_ENTERED'
const NO_CLAIM_PERIOD_ENTERED = 'NO_POS_AMOUNT_ENTERED'
const TERMS_NOT_ACCEPTED = 'TERMS_NOT_ACCEPTED'
const PRICE_CANT_BE_ZERO = 'PRICE_CANT_BE_ZERO'
const errorsTranslations = {
  [NO_WALLET_CONNECTED as string]: 'No wallet connected',
  [NO_POW_AMOUNT_ENTERED as string]: 'Enter PoW Eth amount',
  [NO_POS_AMOUNT_ENTERED as string]: 'Enter expected PoS amount',
  [TERMS_NOT_ACCEPTED as string]: 'Accept terms and conditions',
  [PRICE_CANT_BE_ZERO as string]: "Price can't be 0",
}

type Props = {
  account: string | undefined
  ethPoWAmount: string
  ethPoSAmount: string
  claimPeriodInSec: string | number
  termsAccepted: boolean
  userPrice: string | number
  suggestedPrice: null | number
}
const validateForm = ({
  account,
  ethPoWAmount,
  ethPoSAmount,
  claimPeriodInSec,
  termsAccepted,
  userPrice,
  suggestedPrice,
}: Props) => {
  if (!account) {
    throw new Error(NO_WALLET_CONNECTED)
  }

  console.log('validate form user price', userPrice)
  if (userPrice !== '' && userPrice == 0) {
    throw new Error(PRICE_CANT_BE_ZERO)
  }

  if (ethPoWAmount === '') {
    throw new Error(NO_POW_AMOUNT_ENTERED)
  }

  if (ethPoSAmount === '') {
    throw new Error(NO_POS_AMOUNT_ENTERED)
  }

  if (!claimPeriodInSec) {
    throw new Error(NO_CLAIM_PERIOD_ENTERED)
  }

  if (!termsAccepted) {
    throw new Error(TERMS_NOT_ACCEPTED)
  }
}

function getSwapIdFromTxReceipt(txReceipt: any) {
  const swapId = txReceipt.events[0].args.id
  return swapId
}

const valueToString = (number: string | number) => {
  if (number === '') {
    return '0'
  }
  if (number === '0.0') {
    return '0'
  }

  return String(number)
}

function DumpBox() {
  const [claimPeriodInSec, setClaimPeriodInSec] = React.useState<string | number>(defaultClaimPeriodInSec)
  const [isCommitting, setIsCommitting] = React.useState(false)
  const [commitTxHash, setCommitTxHash] = React.useState('')
  const [stateSecret, setStateSecret] = useState('')
  const [shareLink, setShareLink] = React.useState('')
  const [ethPoSAmount, setPoSAmount] = useState('0.0')
  const [ethPoWAmount, setPoWAmount] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [swapId, setSwapId] = useState(null)
  const suggestedPrice = useStore(state => state.suggestedPrice)
  // const [userPrice, setUserPrice] = useState('')
  const userPrice = useStore(state => state.userPrice)
  // const [hasModifiedPrice, setHasModifiedPrice] = useState(false)

  // console.log("dump-bpox price", price)
  // useEffect(() => {
  //     if(price && minPrice === "") {
  //         setMinPrice(price)
  //     }
  // }, [minPrice, price])

  // console.log('price from api', price)
  const setNotification = useStore(state => state.setNotification)
  const { account, provider, connector } = useWeb3React<Web3Provider>()

  const [error, setError] = useState('')
  const handleClickCopy = async () => {
    await navigator.clipboard.writeText(shareLink)
  }

  const connectedETHAddress = useStore(state => state.connectedETHAddress)

  useEffect(() => {
    try {
      if (ethPoWAmount && (suggestedPrice || userPrice)) {
        if (userPrice !== '') {
          console.log('update user price')
          setPoSAmount(
            formatEther(
              BigNumber.from(parseEther(valueToString(ethPoWAmount)))
                .mul(BigNumber.from(parseEther(valueToString(userPrice))))
                .div(parseEther('1'))
            ).toString()
          )
        } else {
          // const wtf =  BigNumber.from(ethPoWAmount || 0).mul(BigNumber.from(suggestedPrice  || 0))
          console.log('correct wtf')
          // console.log('correct', wtf)
          setPoSAmount(
            formatEther(
              BigNumber.from(parseEther(valueToString(ethPoWAmount)))
                .mul(BigNumber.from(parseEther(valueToString(suggestedPrice))))
                .div(parseEther('1'))
            ).toString()
          )
        }
      } else {
        setPoSAmount('0.0')
      }

      validateForm({
        account,
        ethPoWAmount,
        ethPoSAmount,
        claimPeriodInSec,
        termsAccepted,
        userPrice,
        suggestedPrice,
      })

      setError('')
    } catch (e) {
      const message = getErrorMessage(e)
      setError(message)
    }
  }, [account, ethPoWAmount, ethPoSAmount, claimPeriodInSec, termsAccepted, userPrice, suggestedPrice])

  const handleClickCommit = async () => {
    try {
      setIsCommitting(true)

      validateForm({
        account,
        ethPoWAmount,
        ethPoSAmount,
        claimPeriodInSec,
        termsAccepted,
        userPrice,
        suggestedPrice,
      })

      const secret = hexlify(randomBytes(32))
      const hashedSecret = keccak256(secret)

      const requestedEthAmount = String(ethPoSAmount)

      const commitment = {
        claimPeriodInSec: claimPeriodInSec as string,
        hashedSecret,
        initiatorEthAddress: connectedETHAddress as string,
        lockedEthAmount: ethPoWAmount,
        expectedAmount: requestedEthAmount,
        recipient: ZERO_ADDRESS,
      }
      const txResponse = await commit(
        commitment,
        // @ts-ignore
        provider?.getSigner(account)
      )
      setCommitTxHash(txResponse.hash)
      const txReceipt = await txResponse.wait()

      setSwapId(getSwapIdFromTxReceipt(txReceipt))

      setClaimPeriodInSec('')

      setStateSecret(secret)

      const shareLink = `${process.env.PUBLIC_URL}/commit?hashed-secret=${hashedSecret}`
      setShareLink(shareLink)
    } catch (error) {
      console.log('error when submitting', error)
      setNotification({ type: 'error', description: getErrorMessage(error), title: 'Error' })
    } finally {
      setIsCommitting(false)
    }
  }

  const reset = () => {
    setCommitTxHash('')
    setSwapId(null)
    setStateSecret('')
    setPoSAmount('')
    setPoWAmount('')
    setTermsAccepted(false)
    setClaimPeriodInSec(defaultClaimPeriodInSec)
  }
  if (isCommitting || commitTxHash) {
    return (
      <DealStatus
        ethPoW={ethPoWAmount}
        ethPoS={ethPoSAmount}
        isCommitting={isCommitting}
        commitTxHash={commitTxHash}
        expireTime={claimPeriodInSec}
        swapId={swapId}
        stateSecret={stateSecret}
        onRevealComplete={async () => {
          reset()

          try {
            await switchChain(connector, SupportedChainId.LOCAL_POW)
          } catch (e) {
            console.log('You need to switch the chain', e)
          }
        }}
      />
    )
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
        <Settings
          onSettingUpdate={(setting, value) => {
            if (setting === 'dumpOfferValidFor') {
              setClaimPeriodInSec(+value * 60)
            }
          }}
        />
      </div>

      <InputRow
        id="tlAmount"
        value={ethPoWAmount}
        onChangeInputValue={value => {
          setPoWAmount(value)
        }}
        type="text"
        placeholder="0.0"
        pattern={'^[0-9]*[.,]?[0-9]*$'}
        append={<CurrencyBadge icon={PowDumpSmallLogo} name={'PoW ETH'} />}
      />
      <div className="w-full">
        <div className="flex flex-col rounded-md dark:bg-rich-black-lighter pt-2 border border-1 border-rich-black-lightest">
          <div className="flex flex-row my-2">
            <div className={'flex-1 mx-5'}>
              <PriceRow />
              <div className={'h-px bg-rich-black-lightest my-2'}></div>

              <div className={'flex flex-row justify-between'}>
                <div>You get</div>
                <div className={'flex flex-row'}>
                  <CurrencyBadge icon={EthereumLogo} name={`${commify(Number(ethPoSAmount).toFixed(5))} ETH`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={'bg-brown-orange rounded-lg p-5'}>
        <p className={'text-gray text-sm'}>
          Click Dump below to create a transaction that tries to initiate the above trade. This action involves locking
          the specified PoW ETH amount.
        </p>
        <p className={'pt-2 text-sm text-gray'}>
          If PoWDump can not execute the trade within the subsequent 45 PoW Chain blocks, you can reclaim the locked PoW
          ETH**.
        </p>

        <label className={'text-sm pt-2'}>
          <input
            className={'mt-2'}
            type="checkbox"
            id="terms"
            name="terms"
            value="terms"
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
          />{' '}
          I understand and accept the Terms & Conditions
        </label>
      </div>

      <div className="flex flex-row gap-x-2 w-full">
        <Button buttonType={error ? 'disabled' : 'primary'} disabled={!!error} onClick={handleClickCommit} fullWidth>
          {error ? errorsTranslations[error] : 'Dump now!'}
        </Button>
      </div>
    </DumpBoxLayout>
  )
}

export { DumpBox }
