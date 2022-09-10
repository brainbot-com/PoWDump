import React, { Fragment, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { classNames } from '../../utils/tailwind'
import { usePrice } from '../../hooks/use-price'
import { useStore } from '../../store'
import { CustomDecimalInput } from '../input-row'
import { SuggestedPriceTooltipHelp } from './suggested-price-tooltip-help'
import { Cog8ToothIcon as CogIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid'

type Props = {
  onSettingUpdate: (setting: string, value: string) => void
}

export function Settings({ onSettingUpdate }: Props) {
  const userPrice = useStore(state => state.userPrice)
  const setUserPrice = useStore(state => state.setUserPrice)
  const [offerValidFor, setOfferValidFor] = useState('')
  const [suggestedPrice, priceFromAPI] = usePrice()

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={classNames(
              // open ? 'text-gray-900' : 'text-gray-500',
              'group inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none ',
              'focus:ring-0 focus:ring-offset-0 focus:ring-indigo-500'
            )}
          >
            <CogIcon
              className={classNames(open ? 'text-gray-600' : 'text-gray-400', 'ml-2 h-5 w-5 group-hover:text-gray-500')}
              aria-hidden="true"
            />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 left-7 transform -translate-x-full mt-3 px-2 w-screen max-w-[280px] sm:px-0">
              <div className="rounded-md shadow-lg ring-1 ring-rich-black ring-opacity-5 border border-zinc-700 overflow-hidden">
                <div
                  className="relative dark:bg-zinc-800 px-2 py-6 sm:gap-2 sm:p-4
                                    text-zinc-400
                                     "
                >
                  Dump offer valid for:
                  <div>
                    <input
                      className={
                        'dark:bg-zinc-800 border border-zinc-700 rounded rounded-lg w-1/3 mr-2 px-2 text-right'
                      }
                      type={'text'}
                      placeholder={'10'}
                      onChange={e => {
                        setOfferValidFor(e.target.value)
                        onSettingUpdate('dumpOfferValidFor', e.target.value)
                      }}
                      value={offerValidFor}
                    />
                    minutes
                  </div>
                  <div className={'mt-5'}>
                    <span className={'text-sm'}>Coingecko price: {priceFromAPI} </span>
                    <br />
                    <div className={'text-sm flex flex-row'}>
                      suggested price: {suggestedPrice}
                      <SuggestedPriceTooltipHelp price={String(priceFromAPI)}>
                        <QuestionMarkCircleIcon className={'w-4 h-4 text-zinc-400'} />
                      </SuggestedPriceTooltipHelp>
                      <div className={'ml-1'}></div>
                    </div>
                    custom price:
                    <div>
                      <CustomDecimalInput
                        type={'text'}
                        id={'custom-price'}
                        className={
                          'dark:bg-zinc-800 border border-zinc-700 rounded rounded-lg w-2/3 mr-2 px-2 text-right'
                        }
                        onChangeInputValue={value => {
                          setUserPrice(value)
                        }}
                        value={userPrice !== null ? userPrice : ''}
                        placeholder="0.0"
                        pattern={'^[0-9]*[.,]?[0-9]*$'}
                      />{' '}
                      ETH
                    </div>
                    {userPrice !== '' && (
                      <button
                        onClick={() => {
                          // setHasUserUpdatedPrice(false)
                          setUserPrice('')
                        }}
                        className={'text-sm'}
                      >
                        reset price to suggested
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
