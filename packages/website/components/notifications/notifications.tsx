/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import { CheckCircleIcon, ExclamationCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { NotificationType, useStore } from '../../store'

const icons = {
  error: <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />,
  success: <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />,
  info: <InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />,
  warning: <ExclamationCircleIcon className="h-6 w-6 text-orange-400" aria-hidden="true" />,
}
export default function Notification() {
  const [show, setShow] = useState(false)
  const [shownError, setShownError] = useState<null | NotificationType>(null)
  const notification = useStore(state => state.notification)

  const icon = notification && notification.type && icons[notification.type]

  useEffect(() => {
    if (notification && shownError !== notification) {
      setShow(true)
      setShownError(notification)
    }

    const timer = setTimeout(() => {
      setShow(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [notification, shownError])

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">{icon}</div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{notification && notification.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{notification && notification.description}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      type="button"
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => {
                        setShow(false)
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  )
}
