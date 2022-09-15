import { useStore } from '../store'
import { useEffect, useState } from 'react'
import { useInterval } from './use-interval'
import { config } from '../config'
import { useWeb3React } from '@web3-react/core'
import { isSwapSupportedOnChain } from '../utils/helpers'

const fetchPrice = (chainId: number) => {
  const isPoWChainId = isSwapSupportedOnChain(chainId)
  if (!isPoWChainId) {
    return Promise.resolve(0)
  }
  return fetch(config.PRICE_FEED_API_URLS[chainId])
    .then(res => res.json())
    .then(data => {
      return data[config.PRICE_CURRENCY_IDS[chainId]].eth
    })
}
let didFetchPrice: { [chainId: number]: boolean } = {}

export function usePrice() {
  const priceFromAPI = useStore(state => state.priceFromAPI)
  const setPriceFromAPI = useStore(state => state.setPriceFromAPI)
  const suggestedPrice = useStore(state => state.suggestedPrice)
  const setSuggestedPrice = useStore(state => state.setSuggestedPrice)
  const { chainId } = useWeb3React()
  const [fetching, setIsFetching] = useState(false)

  const setAllPrices = (price: number) => {
    setPriceFromAPI(price)
    setSuggestedPrice(price - (price * config.DUMP_DISCOUNT) / 100)

    setTimeout(() => {
      setIsFetching(false)
    }, 1000)
  }

  useEffect(() => {
    if (chainId && !didFetchPrice[chainId]) {
      didFetchPrice[chainId] = true
      setIsFetching(true)
      fetchPrice(chainId).then(price => {
        setAllPrices(price)
      })
    }
  }, [chainId])

  useInterval(() => {
    if (!chainId) return
    setIsFetching(true)
    fetchPrice(chainId).then(price => {
      setAllPrices(price)
    })
  }, 20000)

  return [suggestedPrice, priceFromAPI, fetching]
}
