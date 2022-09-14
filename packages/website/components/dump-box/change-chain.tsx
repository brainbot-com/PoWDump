import {useWeb3React} from '@web3-react/core'
import {Web3Provider} from '@ethersproject/providers'
import {Button} from '../button'
import {switchChain} from '../../utils/switchChain'
import React from 'react'

export const ChangeChain = ({chainId}: { chainId: number }) => {
    const {connector} = useWeb3React<Web3Provider>()

    return (
        <>
            <Button
                buttonType={'primary'}
                onClick={async () => {
                    try {
                        await switchChain(connector, chainId)
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