import { JsonRpcSigner, TransactionResponse } from '@ethersproject/providers'
import { getPoSSwapContract, getPoWSwapContract } from './swapContract'

export async function commit(
  params: {
    claimPeriodInSec: string
    hashedSecret: string
    value: string
    expectedAmount: string
    recipient: string
  },
  signer: JsonRpcSigner
) {
  const ethSwapContract = getPoWSwapContract(signer)
  const txResponse: TransactionResponse = await ethSwapContract.commit(
    params.claimPeriodInSec,
    params.hashedSecret,
    params.value,
    params.expectedAmount,
    params.recipient,
    {
      value: params.value,
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
