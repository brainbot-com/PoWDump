/**
 * Code copied from uniswap/interface
 * https://github.com/Uniswap/interface/blob/main/src/utils/maxAmountSpend.ts
 *
 * Modified to keep 3 times .01 ETH - .01 ETH for tx fee and .02 ETH if the tx fails and the user needs to refund
 */

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import JSBI from 'jsbi'

// keep .01 ETH for gas for the transaction itself, and keep .01 ETH for eventual gas for a refund and .01 ETH for the actual refund tx cost
const MIN_NATIVE_CURRENCY_FOR_GAS: JSBI = JSBI.multiply(
  JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)),
  JSBI.BigInt(3)
) // .03 ETH

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function maxAmountSpend(currencyAmount?: CurrencyAmount<Currency>): CurrencyAmount<Currency> | undefined {
  if (!currencyAmount) return undefined
  if (currencyAmount.currency.isNative) {
    if (JSBI.greaterThan(currencyAmount.quotient, MIN_NATIVE_CURRENCY_FOR_GAS)) {
      return CurrencyAmount.fromRawAmount(
        currencyAmount.currency,
        JSBI.subtract(currencyAmount.quotient, MIN_NATIVE_CURRENCY_FOR_GAS)
      )
    } else {
      return CurrencyAmount.fromRawAmount(currencyAmount.currency, JSBI.BigInt(0))
    }
  }
  return currencyAmount
}
