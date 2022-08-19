import { Contract } from '@ethersproject/contracts'
import { JsonRpcSigner, TransactionResponse } from '@ethersproject/providers'
// @ts-ignore
import abis from '@project/dump-pow-contracts/artifacts/contracts/EtherSwap.sol/EtherSwap.json'
import config from '../config'

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
  console.log(
    'coooontract',
    config.ETH_POS_CONTRACT_ADDRESS,
    abis.abi,
    signer,
    params.claimPeriodInSec,
    params.hashedSecret,
    params.initiatorEthAddress,
    params.expectedAmount,
    {
      value: params.lockedEthAmount,
    }
  )
  const ethSwapContract = new Contract(config.ETH_POS_CONTRACT_ADDRESS, abis.abi, signer)
  const txResponse: TransactionResponse = await ethSwapContract.commit(
    params.claimPeriodInSec,
    params.hashedSecret,
    params.expectedAmount,
    params.recipient,
    {
      value: params.lockedEthAmount,
      gasLimit: '1000000',
    }
  )

  return txResponse
}

export async function addRecipient(
  params: {
    recipient: string
    hashedSecret: string
  },
  signer: JsonRpcSigner
) {
  const { recipient, hashedSecret } = params
  const ethSwapContract = new Contract(config.ETH_POS_CONTRACT_ADDRESS, abis.abi, signer)
  const txResponse: TransactionResponse = await ethSwapContract.addRecipient(hashedSecret, recipient)

  return txResponse
}

export async function claim(secret: string, signer: JsonRpcSigner) {
  const ethSwapContract = new Contract(config.ETH_POS_CONTRACT_ADDRESS, abis.abi, signer)
  const txResponse: TransactionResponse = await ethSwapContract.secretProof(secret)

  return txResponse
}
