import config from "../config";

export function formatAddress(value: string, length: number = 4) {
  return `${value.substring(0, length + 2)}...${value.substring(value.length - length)}`
}

export function isSwapSupportedOnChain(chainId: number) {
  const swapSupportingChains = config.ENFORCE_SWAP_ON_CHAINS

  return swapSupportingChains.includes(chainId)
}
