import React from 'react'
import { Tooltip } from '../tooltip'
import config from '../../config'

export function SuggestedPriceTooltipHelp(props: { price: string; children: React.ReactNode, strategy: 'absolute' | 'fixed', isReferenceHidden?: boolean }) {
  return (
    <Tooltip
      label={
        <div className="flex items-center bg-rich-black-lighter text-white text-sm font-medium p-2 rounded-sm shadow-md max-w-[250px] border border-rich-black-lightest">
          This price is the latest Coingecko price {props.price} minus {config.DUMP_DISCOUNT}%. For a volatile market,
          the discount improves the likelihood for the transaction to go through.
        </div>
      }
      placement={'top'}
      strategy={props.strategy}
      isReferenceHidden={props.isReferenceHidden}
    >
      {props.children}
    </Tooltip>
  )
}
