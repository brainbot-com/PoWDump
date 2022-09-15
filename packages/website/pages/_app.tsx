import '../styles/globals.css'
import type {AppProps} from 'next/app'
import {QueryClient, QueryClientProvider} from "react-query";
import {Web3ReactHooks, Web3ReactProvider} from '@web3-react/core'
import {Connector} from '@web3-react/types'
import {Connection, ConnectionType} from '../connection'
import {getConnection, getConnectionName} from '../connection/utils'
import {useMemo} from 'react'
import useEagerlyConnect from "../hooks/useEagerlyConnect";
import {Blocklist} from "../components/blocklist";
const queryClient = new QueryClient();

const availableConnections = [
    ConnectionType.INJECTED
]

function MyApp({Component, pageProps}: AppProps) {
    useEagerlyConnect()
    const connections = availableConnections.map(getConnection)
    const connectors: [Connector, Web3ReactHooks][] = connections.map(({hooks, connector}) => [connector, hooks])

    const key = useMemo(() => connections.map(({type}: Connection) => getConnectionName(type)).join('-'), [connections])

    return (
        <Web3ReactProvider connectors={connectors} key={key}>
            <QueryClientProvider client={queryClient}>
                <Blocklist>
                    <Component {...pageProps} />
                </Blocklist>
            </QueryClientProvider>
        </Web3ReactProvider>
    )
}

export default MyApp
