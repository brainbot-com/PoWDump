import React, { Fragment, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { classNames } from '../../utils/tailwind'
import { CogIcon } from '@heroicons/react/solid'

type Props = {
  onSettingUpdate: (setting: string, value: string) => void
}

export function Settings({ onSettingUpdate }: Props) {
  const [offerValidFor, setOfferValidFor] = useState('')
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
            <Popover.Panel className="absolute z-10 left-7 transform -translate-x-full mt-3 px-2 w-screen max-w-[220px] sm:px-0">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div
                  className="relative dark:bg-zinc-800 px-2 py-6 sm:gap-2 sm:p-4
                                    text-zinc-400
                                    border border-zinc-700 rounded rounded-lg"
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
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
