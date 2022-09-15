import { JsonRpcProvider } from '@ethersproject/providers'

import { SupportedChainId } from './chains'

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY
if (typeof INFURA_KEY === 'undefined') {
  throw new Error(`NEXT_PUBLIC_INFURA_KEY must be a defined environment variable`)
}

export const MAINNET_PROVIDER = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_KEY}`)

/**
 * These are the network URLs used by the interface when there is not another available source of chain data
 */
export const RPC_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ROPSTEN]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.GOERLI]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.KOVAN]: `https://kovan.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.HARDHAT]: `http://hardhat.local:8545`,
  [SupportedChainId.LOCAL_POS]: `http://localhost:8545`,
  [SupportedChainId.LOCAL_POW]: `http://localhost:8546`,
  [SupportedChainId.ETF]: `https://rpc.etherfair.org`,
  [SupportedChainId.ETHW]: `https://mainnet.ethereumpow.org/`,
}
