import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import React, { useEffect, useState } from 'react'
import { keccak256 } from '@ethersproject/keccak256'
import { request } from 'graphql-request'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import { getSwapContract } from '../../utils/swapContract'
import { switchChain } from '../../utils/switchChain'
import { SupportedChainId } from '../../constants/chains'

export const SearchSwap = ({ recipient, initiator, secret, expectedPoSAmount }) => {
  const { account, connector, provider } = useWeb3React<Web3Provider>()
  const [foundSwap, setFoundSwap] = useState<string | undefined>(undefined)

  const hashedSecret = keccak256(secret)
  useEffect(() => {
    console.log('provider', provider)
    if (provider) {
      const onBlockListener = async blockNumber => {
        const data = await request('https://localhost/subgraphs/name/pos', posQuery, {
          recipient: String(recipient),
          hashedSecret: String(hashedSecret),
          initiator: String(initiator),
        })

        console.log('search swap', data)

        if (data) {
          const { swapCommitments } = data

          if (swapCommitments.length === 1) {
            const { id, value } = swapCommitments[0]

            // 3000000000000000000
            console.log('wtf2', value, parseUnits(value, 'wei'), parseEther(expectedPoSAmount))

            if (parseUnits(value, 'wei').eq(parseEther(expectedPoSAmount))) {
              console.log('swaps appear to have same values')

              setFoundSwap(swapCommitments[0])
              // foundSwapId(id)
              // provider.removeAllListeners('block')
            }
            // const contract = getSwapContract(provider)
            //
            // console.log('id', id)
            //
            // const swap = await contract.swaps(id)
            //
            // const fee = await contract.feeFromSwapValue(swap.value)
            // console.log("wtf", swap.value.toString(), parseEther(expectedPoSAmount))
            // // console.log(swap.value.sub(fee), parseEther(expectedPoSAmount))
            // if(swap.value.eq(parseEther(expectedPoSAmount))) {
            //   console.log('correct amount locked in swap')
            // } else {
            //   console.log("amount locked in swap is not correct")
            // }
            // console.log("found swap", swap)
            // provider.removeAllListeners('block')
          }

          // if (swapCommitment) {
          //   if (swapCommitment.recipient !== ZERO_ADDRESS) {
          //     onRecipient(swapCommitment.recipient)
          //     setRecipient(swapCommitment.recipient)
          //
          //     provider.removeAllListeners('block')
          //   }
          // }
        }
      }

      provider.on('block', onBlockListener)
    }
  }, [provider])

  if (foundSwap) {
    return (
      <div>
        Found swap with id: {foundSwap.id} and value: {foundSwap.value}
        Reveal secret on Pos chain to claim funds.
        <button
          onClick={async () => {
            const contract = getSwapContract(provider.getSigner())

            try {
              await switchChain(connector, SupportedChainId.LOCAL_POS)
            } catch (e) {
              console.log('You need to switch the chain', e)
            }

            try {
              await contract.claim(foundSwap.id, secret)
            } catch (e) {
              console.log('You need to switch the chain', e)
            }
          }}
        >
          Reveal secret
        </button>
      </div>
    )
  }
  return <div>no swap found yet.</div>
}