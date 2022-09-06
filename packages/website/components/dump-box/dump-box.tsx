import React, {useEffect, useState} from 'react'

import {useStore} from '../../store'
import {Button} from '../button'
import {hexlify} from '@ethersproject/bytes'
import {randomBytes} from '@ethersproject/random'
import {keccak256} from '@ethersproject/keccak256'
import {commit} from '../../utils/eth-swap'
import {ZERO_ADDRESS} from '../../config'
import {Settings} from './dump-settings'
import {InputRow} from '../input-row'
import {useWeb3React} from '@web3-react/core'
import {Web3Provider} from '@ethersproject/providers'

import {defaultClaimPeriodInSec} from '../../constants'
import {getErrorMessage} from '../../utils/error'
import {SearchSwap} from './search-swap'
import {SearchRecipient} from './search-recipient'
//@ts-ignore
import PowDumpLogo from "../../public/assets/images/POWdump_Horizontal_logo.png";
import PowDumpSmallLogo from "../../public/assets/images/powdump_dapp_small_pow.png";
import EthereumLogo from "../../public/assets/images/ethereum-logo.png";

const NO_WALLET_CONNECTED = 'NO_WALLET_CONNECTED'
const NO_POW_AMOUNT_ENTERED = 'NO_POW_AMOUNT_ENTERED'
const NO_POS_AMOUNT_ENTERED = 'NO_POS_AMOUNT_ENTERED'
const NO_CLAIM_PERIOD_ENTERED = 'NO_POS_AMOUNT_ENTERED'
const TERMS_NOT_ACCEPTED = 'TERMS_NOT_ACCEPTED'
const errorsTranslations = {
    [NO_WALLET_CONNECTED as string]: 'No wallet connected',
    [NO_POW_AMOUNT_ENTERED as string]: 'Enter PoW Eth amount',
    [NO_POS_AMOUNT_ENTERED as string]: 'Enter expected PoS amount',
    [TERMS_NOT_ACCEPTED as string]: 'Accept terms and conditions',
}

type Props = {
    account: string | undefined
    ethPoWAmount: string
    ethPoSAmount: string
    claimPeriodInSec: string | number,
    termsAccepted: boolean
}
const validateForm = ({account, ethPoWAmount, ethPoSAmount, claimPeriodInSec, termsAccepted}: Props) => {
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

    if (!termsAccepted) {
        throw new Error(TERMS_NOT_ACCEPTED)
    }

}


function getSwapIdFromTxReceipt(txReceipt: any) {
    const swapId = txReceipt.events[0].args.id
    return swapId
}

const CurrencyBadge = ({icon, name}: {icon: string, name: string}) => {
    return (
        <div className={"flex flex-row content-center items-center"}>
            <img src={icon}
                 style={{height: "20px"}}
                 className={"mr-1"}/>
            <span className={"text-white"}>{name}</span>
        </div>)
}

function DumpBox() {
    const [claimPeriodInSec, setClaimPeriodInSec] = React.useState<string | number>(defaultClaimPeriodInSec)
    const [isCommitting, setIsCommitting] = React.useState(false)
    const [commitTxHash, setCommitTxHash] = React.useState('')
    const [stateSecret, setStateSecret] = useState('')
    const [shareLink, setShareLink] = React.useState('')
    const [ethPoSAmount, setPoSAmount] = useState('')
    const [ethPoWAmount, setPoWAmount] = useState('')
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [swapId, setSwapId] = useState(null)
    const [counterparty, setCounterparty] = useState('')
    const setNotification = useStore(state => state.setNotification)
    const {account, provider} = useWeb3React<Web3Provider>()

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
                termsAccepted
            })

            setError('')
        } catch (e) {
            const message = getErrorMessage(e)
            setError(message)
        }
    }, [account, ethPoWAmount, ethPoSAmount, claimPeriodInSec, termsAccepted])

    const handleClickCommit = async () => {
        try {
            setIsCommitting(true)

            validateForm({account, ethPoWAmount, ethPoSAmount, claimPeriodInSec, termsAccepted})

            const secret = hexlify(randomBytes(32))
            const hashedSecret = keccak256(secret)

            const requestedEthAmount = String(ethPoWAmount)

            const commitment = {
                claimPeriodInSec: claimPeriodInSec as string,
                hashedSecret,
                initiatorEthAddress: connectedETHAddress as string,
                lockedEthAmount: ethPoSAmount,
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
            setNotification({type: 'error', description: getErrorMessage(error), title: 'Error'})
        } finally {
            setIsCommitting(false)
        }
    }

    if (isCommitting && commitTxHash === '') {
        return (<div>
            Waiting for confirmation
            Trying to dump {ethPoWAmount} ETHPOW for {ethPoSAmount} ETH on POS
            The deal will be valid for {claimPeriodInSec} seconds
        </div>)
    }

    if (commitTxHash && swapId === null) {
        return (
            <div>
                <div>
                    <div>Waiting for transaction to be mined</div>
                    <div>Transaction hash: {commitTxHash}</div>
                    <div>Secret: {stateSecret}</div>
                </div>
            </div>
        )
    }

    if (commitTxHash && swapId !== null && account) {
        return (
            <div>
                <div>
                    <div>
                        <SearchRecipient swapId={swapId} onRecipient={address => setCounterparty(address)}/>
                        {counterparty && (
                            <SearchSwap recipient={account} secret={(stateSecret)} initiator={counterparty}
                                        expectedPoSAmount={ethPoSAmount}/>
                        )}
                    </div>

                    <div>Transaction hash: {commitTxHash}</div>
                    <div>Secret: {stateSecret}</div>


                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto">
            <img src={PowDumpLogo} alt={"POWDump logo"}/>

            <p className={"text-center mt-10 font-medium"}>
                This DApp allows you to dump your Pow Eth that you have on the Proof-of-Work Ethereum chain
                (aka the fork) for ETH on the canonical Proof-of-Stake Ethereum chain.
            </p>
            <div
                className="
          max-w-md mx-auto flex flex-col items-center mt-10 rounded-lg
           p-4 shadow-md gap-y-4 bg-rich-black text-white
        "
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
                    onChangeInputValue={setPoWAmount}
                    type="text"
                    placeholder="0.0"
                    pattern={'^[0-9]*[.,]?[0-9]*$'}
                    append={<CurrencyBadge icon={PowDumpSmallLogo} name={"PoW ETH"}/>}
                />
                <InputRow
                    id="ethAmount"
                    value={ethPoSAmount}
                    onChangeInputValue={setPoSAmount}
                    type="text"
                    placeholder="0.0"
                    append={<CurrencyBadge icon={EthereumLogo} name={"ETH"}/>}
                />

                <div className={"bg-brown-orange rounded-lg p-5"}>
                    <p className={"text-gray text-sm"}>
                        Click Dump below to create a transaction taht tries to initiate the above trade. This action
                        involves locking the specified PoW ETH amount.
                    </p>
                    <p className={"pt-2 text-sm text-gray"}>
                        If PoWDump can not execute the trade within the subsequent 45 PoW Chain blocks, you can reclaim
                        the locked PoW ETH**.
                    </p>

                    <label className={"text-sm pt-2"} >
                        <input className={"mt-2"} type="checkbox" id="terms" name="terms" value="terms"
                               onClick={() => setTermsAccepted(!termsAccepted)}
                        /> I understand and accept
                        the Terms & Conditions
                    </label>
                </div>

                <div className="flex flex-row gap-x-2 w-full">
                    <Button buttonType={error ? 'disabled' : 'primary'} disabled={!!error} onClick={handleClickCommit}
                            fullWidth>
                        {error ? errorsTranslations[error] : 'Dump now!'}
                    </Button>

                </div>

                {commitTxHash && (
                    <>
                        <div className="mt-4 text-center break-words" style={{wordBreak: 'break-word'}}>
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            Write down your secret: <strong>{stateSecret}</strong>. You'll need it when you want to
                            claim your Eth.
                        </div>
                        <>
                            <div className="text-xs" style={{wordBreak: 'break-word'}}>
                                The tx was signed. You can give the following link to the counterparty. <br/>
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

export {DumpBox}
