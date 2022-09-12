import { useStore } from '../store'
import { useEffect, useState } from 'react'
import { useInterval } from './use-interval'
import { config } from '../config'

const fetchPrice = () => {
  return fetch(
    config.PRICE_FEED_API_URL
  )
    .then(res => res.json())
    .then(data => {
      return data[config.PRICE_CURRENCY_ID].eth
    })
}
let didFetchPrice = false

export function usePrice() {
  const priceFromAPI = useStore(state => state.priceFromAPI)
  const setPriceFromAPI = useStore(state => state.setPriceFromAPI)
  const suggestedPrice = useStore(state => state.suggestedPrice)
  const setSuggestedPrice = useStore(state => state.setSuggestedPrice)
  const [fetching, setIsFetching] = useState(false)

  const setAllPrices = (price: number) => {
    setPriceFromAPI(price)
    setSuggestedPrice(price - (price ) * config.DUMP_DISCOUNT / 100)

    setTimeout(() => {
      setIsFetching(false)
    }, 1000)
  }

  useEffect(() => {
    if (!didFetchPrice) {
      didFetchPrice = true
      setIsFetching(true)
      fetchPrice().then(price => {
        setAllPrices(price)
      })
    }
  }, [])

  useInterval(() => {
    setIsFetching(true)
    fetchPrice().then(price => {
      setAllPrices(price)
    })
  }, 20000)

  return [suggestedPrice, priceFromAPI, fetching]
}
