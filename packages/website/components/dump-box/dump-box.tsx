import React, { useEffect, useState } from 'react'

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

const NO_WALLET_CONNECTED = 'NO_WALLET_CONNECTED'
const NO_POW_AMOUNT_ENTERED = 'NO_POW_AMOUNT_ENTERED'
const NO_POS_AMOUNT_ENTERED = 'NO_POS_AMOUNT_ENTERED'
const NO_CLAIM_PERIOD_ENTERED = 'NO_POS_AMOUNT_ENTERED'
const errorsTranslations = {
  [NO_WALLET_CONNECTED as string]: 'No wallet connected',
  [NO_POW_AMOUNT_ENTERED as string]: 'Enter PoW Eth amount',
  [NO_POS_AMOUNT_ENTERED as string]: 'Enter expected PoS amount',
}

type Props = {
  account: string | undefined
  ethPoWAmount: string
  ethPoSAmount: string
  claimPeriodInSec: string | number
}
const validateForm = ({ account, ethPoWAmount, ethPoSAmount, claimPeriodInSec }: Props) => {
  if (!account) {
    throw new Error(NO_WALLET_CONNECTED)
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
}

function DumpBox() {
  const [claimPeriodInSec, setClaimPeriodInSec] = React.useState<string | number>(defaultClaimPeriodInSec)
  const [isCommitting, setIsCommitting] = React.useState(false)
  const [commitTxHash, setCommitTxHash] = React.useState('')
  const [stateSecret, setStateSecret] = useState('')
  const [shareLink, setShareLink] = React.useState('')
  const [ethPoSAmount, setPoSAmount] = useState('')
  const [ethPoWAmount, setPoWAmount] = useState('')
  const setNotification = useStore(state => state.setNotification)
  const { account, provider } = useWeb3React<Web3Provider>()

  const [error, setError] = useState('')
  const handleClickCopy = async () => {
    await navigator.clipboard.writeText(shareLink)
  }

  const connectedETHAddress = useStore(state => state.connectedETHAddress)

  useEffect(() => {
    try {
      validateForm({
        account,
        ethPoWAmount,
        ethPoSAmount,
        claimPeriodInSec,
      })

      setError('')
    } catch (e) {
      const message = getErrorMessage(e)
      setError(message)
    }
  }, [provider, ethPoWAmount, ethPoSAmount, claimPeriodInSec])

  const handleClickCommit = async () => {
    try {
      setIsCommitting(true)

      validateForm({ account, ethPoWAmount, ethPoSAmount, claimPeriodInSec })

      const secret = hexlify(randomBytes(32))
      const hashedSecret = keccak256(secret)

      const requestedEthAmount = String(ethPoWAmount)

      const txResponse = await commit(
        {
          claimPeriodInSec: claimPeriodInSec as string,
          hashedSecret,
          initiatorEthAddress: connectedETHAddress as string,
          lockedEthAmount: ethPoSAmount,
          expectedAmount: requestedEthAmount,
          recipient: ZERO_ADDRESS,
        },
        // @ts-ignore
        provider?.getSigner(account)
      )
      const txReceipt = await txResponse.wait()
      setCommitTxHash(txReceipt.transactionHash)
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

  return (
    <div className="container mx-auto">
      <div
        className="
          max-w-md mx-auto flex flex-col items-center mt-10 rounded-lg
           p-4 shadow-md gap-y-4 dark:bg-zinc-900 text-white dark:text-gray-500
        "
      >
        <div className={'flex flex-row w-full items-center'}>
          <div className="text-white text-xl flex-1">Dump</div>
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
          onChangeInputValue={setPoWAmount}
          type="text"
          placeholder="0.0"
          pattern={'^[0-9]*[.,]?[0-9]*$'}
          append={'ethPoW'}
        />
        <InputRow
          id="ethAmount"
          value={ethPoSAmount}
          onChangeInputValue={setPoSAmount}
          type="text"
          placeholder="0.0"
          append={'ethPoS'}
        />

        <div className="flex flex-row gap-x-2 w-full">
          <Button buttonType={error ? 'disabled' : 'primary'} disabled={!!error} onClick={handleClickCommit} fullWidth>
            {error ? errorsTranslations[error] : 'Dump now!'}
          </Button>
        </div>

        {commitTxHash && (
          <>
            <div className="mt-4 text-center break-words" style={{ wordBreak: 'break-word' }}>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              Write down your secret: <strong>{stateSecret}</strong>. You'll need it when you want to claim your Eth.
            </div>
            <>
              <div className="text-xs" style={{ wordBreak: 'break-word' }}>
                The tx was signed. You can give the following link to the counterparty. <br />
                {shareLink}
              </div>
            </>
            <Button buttonType="primary" onClick={handleClickCopy} fullWidth>
              Copy Link
            </Button>
            <div className="bg-green-100 p-4 text-green-700 w-full text-center">
              Successfully committed!{' '}
              <a
                className="underline"
                href={`https://goerli.etherscan.io/tx/${commitTxHash}`}
                target="_blank"
                rel="noreferrer"
              >
                View on Etherscan
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export { DumpBox }
