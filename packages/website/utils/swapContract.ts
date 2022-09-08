import { Contract } from '@ethersproject/contracts'
import { JsonRpcSigner } from '@ethersproject/providers'
// @ts-ignore
import abis from '@package/dump-pow-contracts/artifacts/contracts/EtherSwap.sol/EtherSwap.json'
import config from '../config'

export const getPoSSwapContract = (signer: JsonRpcSigner) => {
    return new Contract(config.ETH_POS_CONTRACT_ADDRESS, abis.abi, signer)
}

export const getPoWSwapContract = (signer: JsonRpcSigner) => {
    return new Contract(config.ETH_POW_CONTRACT_ADDRESS, abis.abi, signer)
}