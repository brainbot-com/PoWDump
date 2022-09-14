import {formatAddress} from '../../utils/helpers'
import {CopyToClipboard} from './copy-to-clipboard'
import React from 'react'

export const SwapMetaRow = ({txHash, swapId}: { txHash: string; swapId: string | null }) => {
    return (
        <div className={`flex ${txHash && swapId ? 'justify-between' : 'justify-center'}`}>
            {txHash && (
                <div className={'text-sm flex flex-row'}>
                    <span className={'font-bold'}>Transaction hash:</span> {formatAddress(txHash, 6)}
                    <CopyToClipboard text={txHash}/>
                </div>
            )}
            {swapId && (
                <div className={'text-sm flex flex-row'}>
                    <span className={'font-bold'}>swap id: </span>
                    {swapId}
                </div>
            )}
        </div>
    )
}