import { JsonRpcSigner, TransactionResponse } from '@ethersproject/providers'
import { getPoSSwapContract, getPoWSwapContract } from './swapContract'

export async function commit(
  params: {
    transactionExpiryTime: string
    claimPeriodInSec: string
    hashedSecret: string
    value: string
    expectedAmount: string
    recipient: string
  },
  signer: JsonRpcSigner
) {
  const ethSwapContract = getPoWSwapContract(signer)

  const txResponse: TransactionResponse = await ethSwapContract[
    'commit(uint64,uint64,bytes32,uint256,uint256,address)'
  ](
    params.transactionExpiryTime,
    params.claimPeriodInSec,
    params.hashedSecret,
    params.value,
    params.expectedAmount,
    params.recipient,
    {
      value: params.value,
    }
  )
  return txResponse
}

export async function claim(secret: string, signer: JsonRpcSigner) {
  const ethSwapContract = getPoSSwapContract(signer)
  const txResponse: TransactionResponse = await ethSwapContract.secretProof(secret)

  return txResponse
}
