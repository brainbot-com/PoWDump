import { Contract } from '@ethersproject/contracts'
import { JsonRpcSigner } from '@ethersproject/providers'
// @ts-ignore
import abis from '@package/dump-pow-contracts/artifacts/contracts/EtherSwap.sol/EtherSwap.json'
import config from '../config'
import {TransactionReceipt} from "@ethersproject/abstract-provider";
import {ethers} from "ethers";
import {sign} from "crypto";

export const getPoSSwapContract = (signer: JsonRpcSigner) => {
    return new Contract(config.ETH_POS_CONTRACT_ADDRESS, abis.abi, signer)
}

export const getPoWSwapContract = async (signer: JsonRpcSigner) => {
    const chainId = await signer.getChainId()
    console.log(config.ETH_POW_CONTRACT_ADDRESSES[chainId])
    return new Contract(config.ETH_POW_CONTRACT_ADDRESSES[chainId], abis.abi, signer)
}

export const getCommitLog = (receipt: TransactionReceipt) => {
    const abi = abis.abi;
    let iface = new ethers.utils.Interface(abi);
    return iface.parseLog(receipt.logs[0]);
};