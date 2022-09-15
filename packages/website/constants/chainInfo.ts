import { SupportedChainId, SupportedL1ChainId } from './chains'
// @ts-ignore
import ethereumLogoUrl from '../public/assets/images/ethereum-logo.png'

export enum NetworkType {
  L1,
  L2,
}

interface BaseChainInfo {
  readonly networkType: NetworkType
  readonly blockWaitMsBeforeWarning?: number
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink: string
  readonly logoUrl: string
  readonly label: string
  readonly helpCenterUrl?: string
  readonly nativeCurrency: {
    name: string // e.g. 'Goerli ETH',
    symbol: string // e.g. 'gorETH',
    decimals: number // e.g. 18,
  }
  readonly color?: string
  readonly backgroundColor?: string
}

export interface L1ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L1
  readonly defaultListUrl?: string
}

export interface L2ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L2
  readonly bridge: string
  readonly statusPage?: string
  readonly defaultListUrl: string
}

export type ChainInfoMap = { readonly [chainId: number]: L1ChainInfo | L2ChainInfo } & { readonly [chainId in SupportedL1ChainId]: L1ChainInfo }

const CHAIN_INFO: ChainInfoMap = {
  [SupportedChainId.MAINNET]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Ethereum',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [SupportedChainId.RINKEBY]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://rinkeby.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Rinkeby',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Rinkeby Ether', symbol: 'rETH', decimals: 18 },
  },
  [SupportedChainId.ROPSTEN]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://ropsten.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Ropsten',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Ropsten Ether', symbol: 'ropETH', decimals: 18 },
  },
  [SupportedChainId.KOVAN]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://kovan.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Kovan',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Kovan Ether', symbol: 'kovETH', decimals: 18 },
  },
  [SupportedChainId.GOERLI]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://goerli.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Görli',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Görli Ether', symbol: 'görETH', decimals: 18 },
  },
  [SupportedChainId.HARDHAT]: {
    networkType: NetworkType.L1,
    docs: 'https://hardhat.org/',
    explorer: 'http://localhost',
    infoLink: '',
    label: 'Hardhat',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Hardhat Ether', symbol: 'hardETH', decimals: 18 },
  },
  [SupportedChainId.LOCAL_POS]: {
    networkType: NetworkType.L1,
    docs: 'https://hardhat.org/',
    explorer: 'http://localhost',
    infoLink: '',
    label: 'localPoS',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Local PoS', symbol: 'LPoS', decimals: 18 },
  },
  [SupportedChainId.LOCAL_POW]: {
    networkType: NetworkType.L1,
    docs: 'https://hardhat.org/',
    explorer: 'http://localhost',
    infoLink: '',
    label: 'localPoW',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Local PoW', symbol: 'LPoW', decimals: 18 },
  },
  [SupportedChainId.ETF]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.dump.today/',
    explorer: 'https://explorer.etherfair.org',
    infoLink: 'https://docs.dump.today/',
    label: 'EthereumFair',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'EthereumFair', symbol: 'ETF', decimals: 18 },
  },
  [SupportedChainId.ETHW]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.dump.today/',
    explorer: 'https://mainnet.ethwscan.com',
    infoLink: 'https://docs.dump.today/',
    label: 'ETHW-mainnet',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'ETHW-mainnet', symbol: 'ETHW', decimals: 18 },
  },
}

export function getChainInfo(chainId: SupportedL1ChainId): L1ChainInfo
export function getChainInfo(chainId: SupportedChainId): L1ChainInfo | L2ChainInfo
export function getChainInfo(
  chainId: SupportedChainId | SupportedL1ChainId | number | undefined
): L1ChainInfo | L2ChainInfo | undefined

/**
 * Overloaded method for returning ChainInfo given a chainID
 * Return type varies depending on input type:
 * number | undefined -> returns chaininfo | undefined
 * SupportedChainId -> returns L1ChainInfo | L2ChainInfo
 * SupportedL1ChainId -> returns L1ChainInfo
 * SupportedL2ChainId -> returns L2ChainInfo
 */
export function getChainInfo(chainId: any): any {
  if (chainId) {
    return CHAIN_INFO[chainId] ?? undefined
  }
  return undefined
}

export const MAINNET_INFO = CHAIN_INFO[SupportedChainId.MAINNET]
export function getChainInfoOrDefault(chainId: number | undefined) {
  return getChainInfo(chainId) ?? MAINNET_INFO
}
