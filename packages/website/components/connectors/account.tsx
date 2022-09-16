import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { formatAddress } from '../../utils/helpers'
import { TransactionHistory } from './transaction-history'
import { Button } from '../button'

export function Account(props: {
  show: boolean
  onClose: (value: ((prevState: boolean) => boolean) | boolean) => void
  onClick: () => void
  value: string
  formattedBalance: string
  onClick1: () => void
}) {
  return (
    <Transition.Root show={props.show} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={props.onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 overflow-y-auto'>
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel
                className='text-white relative transform overflow-hidden rounded-lg bg-rich-black px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6'>
                <div className={'flex flex-col'}>
                  <div className={'flex flex-row items-end justify-between'}>
                    <div className={'font-bold text-xl'}>Account</div>
                    <button onClick={props.onClick}>
                      <XCircleIcon className='h-7 text-white' aria-hidden='true' />
                    </button>
                  </div>
                </div>

                <div className={'mt-5'}>
                  <span className={'font-bold'}>Address:</span> {formatAddress(props.value, 4)}
                </div>
                <div className={''}>
                  <span className={'font-bold'}>Balance:</span> {`${props.formattedBalance} ETH`}
                </div>
                <div className='mt-5 sm:mt-6'>
                  <Button
                    buttonType={'disabled'}
                    className='inline-flex w-full justify-center rounded-md border border-transparent bg-gray-500 px-4 py-2 font-bold text-white '
                    onClick={props.onClick1}
                  >
                    Disconnect
                  </Button>
                </div>
                <div className={'mt-5'}>
                  <TransactionHistory />
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}