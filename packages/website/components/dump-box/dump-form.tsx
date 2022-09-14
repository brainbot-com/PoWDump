import React, { useEffect, useState } from 'react'
import { defaultClaimPeriodInSec, defaultTransactionDeadlineInSec } from '../../constants'
import { useStore } from '../../store'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { commify, formatEther, parseEther } from 'ethers/lib/utils'
import { BigNumber } from '@ethersproject/bignumber'
import { getErrorMessage } from '../../utils/error'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { keccak256 } from '@ethersproject/keccak256'
import { ZERO_ADDRESS } from '../../config'
import { commit } from '../../utils/eth-swap'
import { CustomDecimalInput } from '../input-row'
import { CurrencyBadge } from './currency-badge'
// @ts-ignore
import PowDumpSmallLogo from '../../public/assets/images/powdump_dapp_small_pow.png'
// @ts-ignore
import EthereumLogo from '../../public/assets/images/ethereum-logo.png'
import { Button } from '../button'
import dynamic from 'next/dynamic'
import { isSwapSupportedOnChain } from '../../utils/helpers'
import { useEthBalance } from '../../hooks/useEthBalance'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { ExtendedEther } from '../../utils/ether'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { SupportedChainId } from '../../constants/chains'

const PriceRow = dynamic(() => import('./price-row'), {
  ssr: false,
})
const NO_WALLET_CONNECTED = 'NO_WALLET_CONNECTED'
const NO_POW_AMOUNT_ENTERED = 'NO_POW_AMOUNT_ENTERED'
const NO_POS_AMOUNT_ENTERED = 'NO_POS_AMOUNT_ENTERED'
const NO_CLAIM_PERIOD_ENTERED = 'NO_POS_AMOUNT_ENTERED'
const TERMS_NOT_ACCEPTED = 'TERMS_NOT_ACCEPTED'
const PRICE_CANT_BE_ZERO = 'PRICE_CANT_BE_ZERO'
const SWAP_NOT_SUPPORTED_ON_CHAIN = 'SWAP_NOT_SUPPORTED_ON_CHAIN'
const errorsTranslations = {
  [NO_WALLET_CONNECTED as string]: 'No wallet connected',
  [NO_POW_AMOUNT_ENTERED as string]: 'Enter PoW Eth amount',
  [NO_POS_AMOUNT_ENTERED as string]: 'Enter expected PoS amount',
  [TERMS_NOT_ACCEPTED as string]: 'Accept terms and conditions',
  [PRICE_CANT_BE_ZERO as string]: "Price can't be 0",
  [SWAP_NOT_SUPPORTED_ON_CHAIN as string]: 'Chain not supported for starting a swap',
}

type Props = {
  account: string | undefined
  ethPoWAmount: string
  ethPoSAmount: string
  claimPeriodInSec: string | number
  termsAccepted: boolean
  userPrice: string | number
  suggestedPrice: null | number
  chainId: number | undefined
}

const validateForm = ({
  account,
  ethPoWAmount,
  ethPoSAmount,
  claimPeriodInSec,
  termsAccepted,
  userPrice,
  suggestedPrice,
  chainId,
}: Props) => {
  if (!account) {
    throw new Error(NO_WALLET_CONNECTED)
  }

  if (!chainId || !isSwapSupportedOnChain(chainId)) {
    throw new Error('SWAP_NOT_SUPPORTED_ON_CHAIN')
  }

  if (userPrice !== '' && userPrice == 0) {
    throw new Error(PRICE_CANT_BE_ZERO)
  }

  if (ethPoWAmount === '' || Number(ethPoSAmount) === 0) {
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

export function getSwapIdFromTxReceipt(txReceipt: any) {
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

export function DumpForm() {
  const claimPeriodInSec: number = useStore(state => state.swapSettings.claimPeriodInSec) || defaultClaimPeriodInSec
  const transactionExpiryTime: number =
    useStore(state => state.swapSettings.transactionDeadlineInSec) || defaultTransactionDeadlineInSec
  const form = useStore(state => state.form)
  const [ethPoSAmount, setPoSAmount] = useState('0.0')
  const [ethPoWAmount, setPoWAmount] = useState(form.ethPoWAmount)
  const [termsAccepted, setTermsAccepted] = useState(form.termsAccepted)
  const suggestedPrice = useStore(state => state.suggestedPrice)
  const userPrice = useStore(state => state.userPrice)
  const setForm = useStore(state => state.setForm)
  const updateFormValue = useStore(state => state.updateFormValue)
  const setProcessingCommitment = useStore(state => state.setProcessingCommitment)
  const setTxSecrets = useStore(state => state.setTxSecrets)
  const setSwapSecrets = useStore(state => state.setSwapSecrets)
  const deleteTxSecrets = useStore(state => state.deleteTxSecrets)
  const setNotification = useStore(state => state.setNotification)
  const { account, provider, chainId } = useWeb3React<Web3Provider>()
  const { balance } = useEthBalance()

  const [error, setError] = useState('')

  const isSwapEnabled = account && chainId && isSwapSupportedOnChain(chainId)
  useEffect(() => {
    try {
      if (ethPoWAmount && (suggestedPrice || userPrice)) {
        if (userPrice !== '') {
          setPoSAmount(
            formatEther(
              BigNumber.from(parseEther(valueToString(ethPoWAmount)))
                .mul(BigNumber.from(parseEther(valueToString(userPrice))))
                .div(parseEther('1'))
            ).toString()
          )
        } else {
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
        chainId,
      })

      setError('')
    } catch (e) {
      const message = getErrorMessage(e)
      setError(message)
    }
  }, [account, ethPoWAmount, ethPoSAmount, claimPeriodInSec, termsAccepted, userPrice, suggestedPrice, chainId])

  const handleClickCommit = async () => {
    try {
      validateForm({
        account,
        ethPoWAmount,
        ethPoSAmount,
        claimPeriodInSec,
        termsAccepted,
        userPrice,
        suggestedPrice,
        chainId,
      })

      const secret = hexlify(randomBytes(32))
      const hashedSecret = keccak256(secret)

      const requestedEthAmount = String(ethPoSAmount)
      updateFormValue('isCommitting', true)

      const subgraphCommitment = {
        value: parseEther(ethPoWAmount).toString(),
        expectedAmount: parseEther(requestedEthAmount).toString(),
        emptied: false,
        refunded: false,
        hashedSecret: hashedSecret,
        initiator: account as string,
        recipient: ZERO_ADDRESS,
        endTimeStamp: String(Math.floor((Date.now() + claimPeriodInSec * 1000) / 1000)),
      }
      setProcessingCommitment(subgraphCommitment)

      updateFormValue('signed', false)

      const txResponse = await commit(
        {
          ...subgraphCommitment,
          claimPeriodInSec: String(claimPeriodInSec),
          transactionExpiryTime: String(Math.floor((Date.now() + transactionExpiryTime * 1000) / 1000)),
        },
        // @ts-ignore
        provider?.getSigner(account)
      )

      setForm({
        ...form,
        signed: true,
      })
      setTxSecrets(txResponse.hash, secret)

      updateFormValue('txHash', txResponse.hash)
      const txReceipt = await txResponse.wait()

      const swapId = getSwapIdFromTxReceipt(txReceipt)

      setSwapSecrets(swapId, secret)
      deleteTxSecrets(txResponse.hash)

      setProcessingCommitment({
        ...subgraphCommitment,
        id: swapId,
      })
    } catch (error) {
      console.log('error when submitting', error)
      setProcessingCommitment(null)
      setNotification({ type: 'error', description: getErrorMessage(error), title: 'Error' })
    } finally {
      updateFormValue('isCommitting', false)
    }
  }

  const currencyAmount = CurrencyAmount.fromRawAmount(
    // ChainId doesn't really matter here as the currency is ETH (no matter the chainID)
    ExtendedEther.onCreate(chainId ? chainId : SupportedChainId.MAINNET),
    // @ts-ignore
    balance
  )

  const maxAmount = maxAmountSpend(currencyAmount)
  const maxAmountFormatted = maxAmount ? maxAmount.toExact() : '0'

  return (
    <>
      <div>
        <div className={'relative'}>
          <div className="flex flex-col rounded-md bg-brown-orange pt-4 border border-1 border-transparent hover:border-gray focus-within:border-gray">
            <div className={'flex'}>
              <div className={'flex-1 w-72'}>
                <CustomDecimalInput
                  className={
                    'appearance-none outline-none bg-brown-orange text-2xl text-white pl-4 group-hover:text-white'
                  }
                  id="pow-amount"
                  value={ethPoWAmount}
                  onChangeInputValue={value => {
                    setPoWAmount(value)
                    updateFormValue('ethPoWAmount', value)
                  }}
                  disabled={!isSwapEnabled}
                  type="text"
                  placeholder="0.0"
                  pattern={'^[0-9]*[.,]?[0-9]*$'}
                />
              </div>
              <div className={'mr-5 bg-brown-orange pl-2'}>
                <CurrencyBadge icon={PowDumpSmallLogo} name={'PoW ETH'} />
              </div>
            </div>

            <div className={'flex flex-row justify-end items-center mr-5 text-gray text-sm mb-2'}>
              Balance: {currencyAmount.toFixed(5)}
              {maxAmountFormatted === ethPoWAmount ? null : (
                <button
                  disabled={!isSwapEnabled}
                  className={
                    'bg-gray-500 border border-0 border-transparent rounded-sm px-2 text-gray hover:cursor-pointer hover:text-white hover:border-white hover:bg-rich-black-lighter ml-1'
                  }
                  onClick={() => {
                    setPoWAmount(maxAmountFormatted)
                    updateFormValue('ethPoWAmount', maxAmountFormatted)
                  }}
                >
                  Max
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex flex-col rounded-md dark:bg-rich-black-lighter pt-2 border border-1 border-rich-black-lightest">
          <div className="flex flex-row my-2">
            <div className={`flex-1 mx-5 ${!isSwapEnabled ? 'text-gray' : ''}`}>
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
          If once the transaction is mined, no one matches it on Ethereum Mainnet (PoS) after{' '}
          {Math.floor(claimPeriodInSec / 60)} minutes you can withdraw the locked PoW ETH**.
        </p>

        <label className={'text-sm pt-2'}>
          <input
            className={'mt-2'}
            type="checkbox"
            id="terms"
            name="terms"
            value="terms"
            disabled={!isSwapEnabled}
            checked={termsAccepted}
            onChange={() => {
              setTermsAccepted(!termsAccepted)
              updateFormValue('termsAccepted', !termsAccepted)
            }}
          />{' '}
          <span className={!isSwapEnabled ? 'text-gray' : ''}>I understand and accept the Terms & Conditions</span>
        </label>
      </div>

      <div className="flex flex-row gap-x-2 w-full">
        <Button buttonType={error ? 'disabled' : 'primary'} disabled={!!error} onClick={handleClickCommit} fullWidth>
          {error ? errorsTranslations[error] : 'Dump now!'}
        </Button>
      </div>
    </>
  )
}
