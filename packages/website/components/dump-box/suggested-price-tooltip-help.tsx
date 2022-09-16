import React from 'react'
import { Tooltip } from '../tooltip'
import config from '../../config'

export function SuggestedPriceTooltipHelp(props: {
  price: string
  children: React.ReactNode
  strategy: 'absolute' | 'fixed'
}) {
  return (
    <Tooltip
      label={
        <div className="flex flex-col items-center bg-rich-black-lighter text-white text-xs font-medium p-2 rounded-sm shadow-md max-w-[250px] border border-rich-black-lightest">
          <p>
            This price is the latest Coingecko price {props.price} minus {config.DUMP_DISCOUNT}%. For a volatile market,
            the discount improves the likelihood for the transaction to go through.
          </p>
          <p className={"mt-2"}>
            Third-party and user-generated content is made available for informational purposes only and should not be
            treated as investment advice. POWdump does not endorse or recommend such content and is not responsible for
            its accuracy.
          </p>
        </div>
      }
      placement={'top'}
      strategy={props.strategy}
    >
      {props.children}
    </Tooltip>
  )
}
