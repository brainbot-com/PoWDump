import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { supportedWallets, supportedWalletTypes } from '../../constants'

export function ConnectWallet() {
  let [isOpen, setIsOpen] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<null | supportedWalletTypes>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { account } = useWeb3React<Web3Provider>()

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  useEffect(() => {
    const isWalletConnected = localStorage.getItem('isWalletConnected') === "true"
    const connectedWallet = localStorage.getItem('connectedWallet') as supportedWalletTypes
    setIsConnected(isWalletConnected)
    setConnectedWallet(connectedWallet)
  }, [account])

  return (
    <>
      {isConnected && account && connectedWallet && supportedWallets[connectedWallet] ? (
        supportedWallets[connectedWallet].connector
      ) : (
        <>
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center px-4 py-2 border rounded-lg border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Connect wallet
          </button>
          <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeModal}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-25" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <div className={"absolute bg-black h-full w-full opacity-90"}></div>
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-500 p-6 text-left align-middle shadow-xl transition-all">
                      <div className={'pb-4 flex items-center'}>
                        <div className="hidden sm:block absolute top-0 right-0 pt-5 pr-5">
                          <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="sr-only">Close</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                          Connect Wallet
                        </Dialog.Title>
                      </div>

                      <div className={'flex flex-col space-y-4'}>
                        {Object.values(supportedWallets).map(wallet => {
                          return <div key={wallet.key}>{wallet.connector}</div>
                        })}
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </>
      )}
    </>
  )
}
