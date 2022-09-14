import {useStore} from '../../store'
import {useWeb3React} from '@web3-react/core'
import {Web3Provider} from '@ethersproject/providers'
import {switchChain} from '../../utils/switchChain'
import {SupportedChainId} from '../../constants/chains'
import React from 'react'

export function NewDump({message}: { message: string }) {
    const setProcessingCommitment = useStore(state => state.setProcessingCommitment)
    const resetForm = useStore(state => state.resetForm)

    const {connector} = useWeb3React<Web3Provider>()
    return (
        <div className={'bg-gray-500 rounded-md p-2 text-center text-white'}>
            {message}{' '}
            <button
                className={'underline'}
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