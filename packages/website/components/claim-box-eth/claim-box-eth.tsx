import React, { useEffect, Fragment, useState } from 'react'

import { addRecipient, claim } from '../../utils/eth-swap'
import { getCommitment } from '../../api/local-storage'
import { useStore } from '../../store'
import { request, gql, GraphQLWebSocketClient } from 'graphql-request'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/outline'

import { GRAPHQL_TRANSPORT_WS_PROTOCOL } from 'graphql-ws'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

type commitment = {
  id: string
  hashedSecret: string
  initiator: string
  recipient: string
  endTimeStamp: number
  value: number
  expectedAmount: number
  emptied: boolean
  refunded: boolean
}
const query = gql`
  {
    swapCommitments {
      id
      endTimeStamp
      expectedAmount
      hashedSecret
      initiator
      recipient
      refunded
      value
    }
  }
`

// const socket = new WebSocket(config.SUBGRAPH_URL. GRAPHQL_TRANSPORT_WS_PROTOCOL);
// const client = new GraphQLWebSocketClient(socket);

async function createClient(url: string) {
  return new Promise<GraphQLWebSocketClient>(resolve => {
    const socket = new WebSocketImpl(url, GRAPHQL_TRANSPORT_WS_PROTOCOL)
    const client: GraphQLWebSocketClient = new GraphQLWebSocketClient((socket as unknown) as WebSocket, {
      onAcknowledged: async _p => resolve(client),
    })
  })
}

function ClaimBoxEth() {
  const [hashedSecret, setHashedSecret] = React.useState('')
  const [secret, setSecret] = React.useState('')
  const [claimTxHash, setClaimTxHash] = React.useState('')
  const [isClaiming, setIsClaiming] = React.useState(false)
  const [open, setOpen] = useState(false)
  const [matchCommitment, setMatchCommitment] = useState<null | commitment>(null)

  const { library } = useWeb3React<Web3Provider>()

  const provider = library.provider
  const connectedETHAddress = useStore(state => state.connectedETHAddress)
  const [openSwapCommitments, setOpenSwapCommitments] = React.useState([])
  useEffect(() => {
    // request(config.SUBGRAPH_URL, query).then((data) => {
    //     if (data.swapCommitments) {
    //         setOpenSwapCommitments(data.swapCommitments)
    //     }
    // })

    const client = await createClient(ctx.url)
    const result = new Promise<string>(resolve => {
      var allGreatings = ''
      client.subscribe<{ greetings: string }>(
        gql`
          subscription greetings {
            greetings
          }
        `,
        {
          next: ({ greetings }) => (allGreatings = allGreatings != '' ? `${allGreatings},${greetings}` : greetings),
          complete: () => {
            resolve(allGreatings)
          },
        }
      )
    })
  }, [])

  console.log('open swap commitments', openSwapCommitments)
  const handleClickClaim = async () => {
    try {
      setIsClaiming(true)

      if (!provider) {
        throw new Error('Wallet not connected')
      }

      if (!hashedSecret && !secret) {
        throw new Error('The hashed secret or secret need to be entered')
      }

      let plainSecret

      if (hashedSecret) {
        const commitment = getCommitment(hashedSecret)

        if (!commitment || !commitment.secret) {
          throw new Error('No commitment found for given hash')
        }

        plainSecret = commitment.secret
      } else {
        plainSecret = secret
      }

      const txResponse = await claim(plainSecret, provider.getSigner())
      const txReceipt = await txResponse.wait()
      setClaimTxHash(txReceipt.transactionHash)
    } catch (error) {
      console.log(error)
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <>
      <div>currently open sales:</div>
      <div>
        {openSwapCommitments.map(commitment => {
          return (
            <div>
              <div>hashedSecret: {commitment.hashedSecret}</div>
              <div>initiator: {commitment.initiator}</div>

              <div>locked PoW eth: {commitment.value}</div>
              <div>expected PoS eth: {commitment.expectedAmount}</div>
              <button
                className={'btn'}
                onClick={() => {
                  setMatchCommitment(commitment)
                  setOpen(true)
                }}
              >
                Match commitment
              </button>
            </div>
          )
        })}
      </div>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-sm sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                      <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Step 1. Commit your address to PoW lock contract
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            onClick={() => {
                              if (matchCommitment && connectedETHAddress) {
                                addRecipient(
                                  {
                                    hashedSecret: matchCommitment.hashedSecret,
                                    recipient: connectedETHAddress,
                                  },
                                  provider?.getSigner()
                                )
                              }
                            }}
                          >
                            Commit
                          </button>
                        </p>
                      </div>

                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Step 2. Lock the requested eth PoS funds
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            onClick={() => setOpen(false)}
                          >
                            Lock
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}

export { ClaimBoxEth }
