import React from 'react'
import { usePrice } from '../../hooks/use-price'
import { useStore } from '../../store'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { classNames } from '../../utils/tailwind'
import { SuggestedPriceTooltipHelp } from './suggested-price-tooltip-help'

const percentageChange = (a: number, b: number) => (b / a) * 100 - 100

export const PriceRow = () => {
  const [suggestedPrice, priceFromAPI, fetching] = usePrice()
  const userPrice = useStore(state => state.userPrice)
  const setUserPrice = useStore(state => state.setUserPrice)

  let warning: null | { type: 'warning' | 'alert'; message: string } = null

  if (userPrice !== '') {
    const diff = percentageChange(Number(priceFromAPI), Number(userPrice))
    if (diff > 0 && diff < 2) {
      warning = {
        type: 'warning',
        message: "Price is above current marker. Most probably trade won't be matched!",
      }
    }
    if (diff > 2) {
      warning = {
        type: 'alert',
        message: "Price is way above current marker. Most probably trade won't be matched!",
      }
    }

    if (diff < -10) {
      warning = {
        type: 'warning',
        message: 'Price is way below current market. Most probably you are selling too cheap.',
      }
    }
  }

  let label = 'Suggested price'
  if (userPrice === '' && fetching) {
    label = 'Fetching price...'
  }

  if (userPrice) {
    label = 'Your price'
  }

  return (
    <>
      {warning && (
        <div
          className={classNames(
            `${warning.type === 'warning' ? 'bg-yellow text-black border-yellow-800' : ''}`,
            `${warning.type === 'alert' ? 'bg-red-500 text-white border-yellow-800' : ''}`,
            'px-1 py-2 flex flex-row items-center rounded-sm mb-2'
          )}
        >
          <div className={'w-20'}>
            <ExclamationTriangleIcon />
          </div>
          <div className={'ml-2'}>
            {warning.message}
            <div className={'flex items-center content-center text-sm m-auto w-full'}>
              <button
                className={'bg-rich-black-lightest px-2 rounded-md hover:bg-rich-black mt-2 mb-2 text-white p-1'}
                onClick={() => {
                  setUserPrice('')
                }}
              >
                Use suggested price instead
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={'flex flex-row justify-between'}>
        <div>{label}</div>

        {userPrice !== '' ? (
          Number(userPrice).toFixed(6)
        ) : (
          <SuggestedPriceTooltipHelp price={String(priceFromAPI)}  strategy={"absolute"} isReferenceHidden={false}>
            <div className={'border-b border-dotted hover:cursor-pointer'}>{suggestedPrice} ETH</div>
          </SuggestedPriceTooltipHelp>
        )}
      </div>
    </>
  )
}

export default PriceRow
