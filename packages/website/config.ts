const contractAddresses = process.env.NEXT_PUBLIC_ETH_POW_CONTRACT_ADDRESSES || ''
const subgraphPowUrls = process.env.NEXT_PUBLIC_SUBGRAPH_POW_URLS || ''
const subgraphPosUrl = process.env.NEXT_PUBLIC_SUBGRAPH_POS_URL || ''
const posContractAddress = process.env.NEXT_PUBLIC_ETH_POS_CONTRACT_ADDRESS || ''
const priceFeedUrls = process.env.NEXT_PUBLIC_PRICE_FEED_API_URLS || ''
const priceFeedCurrencyIds = process.env.NEXT_PUBLIC_PRICE_CURRENCY_IDS || ''

if (contractAddresses.length === 0) {
  throw new Error('NEXT_PUBLIC_ETH_POW_CONTRACT_ADDRESSES must be a defined environment variable')
}

if (subgraphPowUrls.length === 0) {
  throw new Error('NEXT_PUBLIC_SUBGRAPH_POW_URLS must be a defined environment variable')
}

if (subgraphPosUrl.length === 0) {
  throw new Error('NEXT_PUBLIC_SUBGRAPH_POS_URL must be a defined environment variable')
}

if (posContractAddress.length === 0) {
  throw new Error('NEXT_PUBLIC_ETH_POS_CONTRACT_ADDRESS must be a defined environment variable')
}

if (priceFeedUrls.length === 0) {
  throw new Error('NEXT_PUBLIC_PRICE_FEED_API_URLS must be a defined environment variable')
}

if (priceFeedCurrencyIds.length === 0) {
  throw new Error('NEXT_PUBLIC_PRICE_CURRENCY_ID must be a defined environment variable')
}

const getObjectOutOfConfigString = (configString: string): { [key: string]: string } => {
  return configString
    .split(',')
    .map(key_item => key_item.split('|'))
    .reduce((prev: { [chainId: string]: string }, curr) => {
      prev[curr[0]] = curr[1]
      return prev
    }, {})
}
export const config: {
  ETH_POS_CONTRACT_ADDRESS: string
  ETH_POW_CONTRACT_ADDRESSES: { [chainId: string]: string }
  SUBGRAPH_POW_URLS: { [chainId: string]: string }
  SUBGRAPH_POS_URL: string
  INFURA_KEY: string
  NETWORK: string
  DUMP_DISCOUNT: number
  PRICE_FEED_API_URLS: { [chainId: string]: string }
  PRICE_CURRENCY_IDS: { [chainId: string]: string }
  ENFORCE_SWAP_ON_CHAINS: Array<number>
  POS_CHAIN_ID: number
  NETWORK_IDS_FOR_DROPDOWN: Array<number>
} = {
  ETH_POS_CONTRACT_ADDRESS: posContractAddress,
  ETH_POW_CONTRACT_ADDRESSES: getObjectOutOfConfigString(contractAddresses),
  SUBGRAPH_POW_URLS: getObjectOutOfConfigString(subgraphPowUrls),
  SUBGRAPH_POS_URL: subgraphPosUrl,
  INFURA_KEY: process.env.NEXT_PUBLIC_INFURA_KEY || '',
  NETWORK: process.env.NEXT_PUBLIC_NETWORK || '',
  DUMP_DISCOUNT: process.env.NEXT_PUBLIC_DUMP_DISCOUNT_PERCENTAGE
    ? Number(process.env.NEXT_PUBLIC_DUMP_DISCOUNT_PERCENTAGE)
    : 0,
  PRICE_FEED_API_URLS: getObjectOutOfConfigString(priceFeedUrls),
  PRICE_CURRENCY_IDS: getObjectOutOfConfigString(priceFeedCurrencyIds),
  ENFORCE_SWAP_ON_CHAINS: process.env.NEXT_PUBLIC_ENFORCE_SWAP_ON_CHAINS
    ? process.env.NEXT_PUBLIC_ENFORCE_SWAP_ON_CHAINS.split(',').map(Number)
    : [],
  POS_CHAIN_ID: process.env.NEXT_PUBLIC_POS_CHAIN_ID ? Number(process.env.NEXT_PUBLIC_POS_CHAIN_ID) : 1,
  NETWORK_IDS_FOR_DROPDOWN: process.env.NEXT_PUBLIC_NETWORK_IDS_FOR_DROPDOWN
    ? process.env.NEXT_PUBLIC_NETWORK_IDS_FOR_DROPDOWN.split(',').map(Number)
    : [],
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export default config
