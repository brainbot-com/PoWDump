import { JsonRpcSigner, TransactionResponse } from '@ethersproject/providers'
import { getPoSSwapContract, getPoWSwapContract } from './swapContract'
import { parseEther } from 'ethers/lib/utils'

export async function commit(
  params: {
    claimPeriodInSec: string
    hashedSecret: string
    initiatorEthAddress: string
    lockedEthAmount: string
    expectedAmount: string
    recipient: string
  },
  signer: JsonRpcSigner
) {
  const ethSwapContract = getPoWSwapContract(signer)
  const txResponse: TransactionResponse = await ethSwapContract.commit(
    params.claimPeriodInSec,
    params.hashedSecret,
    parseEther(params.lockedEthAmount),
    parseEther(params.expectedAmount),
    params.recipient,
    {
      value: parseEther(params.lockedEthAmount),
      gasLimit: '1000000',
    }
  )
  return txResponse
}

export async function claim(secret: string, signer: JsonRpcSigner) {
  const ethSwapContract = getPoSSwapContract(signer)
  const txResponse: TransactionResponse = await ethSwapContract.secretProof(secret)

  return txResponse
}
