import config from "../config";

export function formatAddress(value: string, length: number = 4) {
  return `${value.substring(0, length + 2)}...${value.substring(value.length - length)}`
}

/**
 * Checks whether the given chainId supports Swaps
 * @param chainId
 */
export function isSwapSupportedOnChain(chainId: number) {
  const swapSupportingChains = config.ENFORCE_SWAP_ON_CHAINS

  return swapSupportingChains.includes(Number(chainId))
}
