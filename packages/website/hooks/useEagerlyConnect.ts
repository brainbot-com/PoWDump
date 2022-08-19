import { Connector } from '@web3-react/types'
import { injectedConnection, networkConnection } from '../connection'
import { useEffect } from 'react'

async function connect(connector: Connector) {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly()
    } else {
      await connector.activate()
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`)
  }
}

export default function useEagerlyConnect() {
  useEffect(() => {
    const isConnected = localStorage.getItem('isWalletConnected') === 'true'

    if (isConnected) {
      connect(networkConnection.connector)
      connect(injectedConnection.connector)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
