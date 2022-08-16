/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import Image from 'next/image'
import { classNames } from '../../utils/tailwind'
import { networks } from '../../constants'

export default function NetworksDropdown() {
  const [selectedNetwork, setSelectedNetwork] = useState('mainnet')
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={classNames(
              open ? 'text-gray-500' : 'text-gray-300',
              'group bg-zinc-900 rounded-lg inline-flex items-center text-base',
              ' hover:text-gray-900 focus:outline-none focus:ring-0 ',
              'focus:ring-offset-0 focus:ring-indigo-500 hover:text-gray-500',
              'p-2'
            )}
          >
            <Image src={networks[selectedNetwork].icon} width={20} height={20} />
            <span className={'ml-1'}>{networks[selectedNetwork].name}</span>
            <ChevronDownIcon
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
            <Popover.Panel className="absolute z-10 left-0 transform -translate-x-0 mt-3 px-2 w-screen max-w-[200px] sm:px-0">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden border border-zinc-700">
                <div className="relative grid gap-6 bg-zinc-900 px-5 py-6 sm:gap-8 sm:p-8 text-white">
                  Select a network
                  {Object.values(networks).map(item => (
                    <span
                      key={item.name}
                      className="-m-3 p-3 block rounded-md hover:bg-zinc-800 transition
                                            text-base font-medium text-white
                                            cursor-pointer
                                            ease-in-out duration-150"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
