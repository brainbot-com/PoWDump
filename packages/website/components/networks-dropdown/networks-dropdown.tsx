/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import Image from 'next/image'
import { classNames } from '../../utils/tailwind'
import { switchChain } from '../../utils/switchChain'
import { useWeb3React } from '@web3-react/core'
import { ALL_SUPPORTED_CHAIN_IDS } from '../../constants/chains'
import { getChainInfo } from '../../constants/chainInfo'
import { useStore } from '../../store'
import { getErrorMessage } from '../../utils/error'

export default function NetworksDropdown() {
  const [selectedNetwork, setSelectedNetwork] = useState(getChainInfo(1))
  const { connector } = useWeb3React()
  const setNotification = useStore(state => state.setNotification)

  const switchNetwork = async (id: number) => {
    try {
      const selectedChainInfo = getChainInfo(id)
      await switchChain(connector, id)
      setSelectedNetwork(selectedChainInfo)
    } catch (e) {
      const message = getErrorMessage(e)
      console.log('error switching chain', e)
      setNotification({ type: 'error', title: 'Error switching chain', description: message })
    }
  }

  return (
    <Popover className="relative">
      {({ open, close }) => (
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
            {selectedNetwork && <Image src={selectedNetwork.logoUrl} width={20} height={20} />}
            {selectedNetwork && <span className={'ml-1'}>{selectedNetwork.nativeCurrency.name}</span>}
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
                  {ALL_SUPPORTED_CHAIN_IDS.map(chainId => {
                    const chainInfo = getChainInfo(chainId)
                    return (
                      <span
                        key={chainId}
                        className="-m-3 p-3 block rounded-md hover:bg-zinc-800 transition
                                            text-base font-medium text-white
                                            cursor-pointer
                                            ease-in-out duration-150"
                        onClick={async () => {
                          close()
                          await switchNetwork(chainId)
                        }}
                      >
                        {chainInfo.nativeCurrency.name}
                      </span>
                    )
                  })}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
