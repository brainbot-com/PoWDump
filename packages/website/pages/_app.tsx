import '../styles/globals.css'
import type {AppProps} from 'next/app'
import {QueryClient, QueryClientProvider} from "react-query";
import useWeb3Modal from "../hooks/useWeb3Modal";
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

function getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(provider)
    return library
}

const queryClient = new QueryClient();

function MyApp({Component, pageProps}: AppProps) {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <QueryClientProvider client={queryClient}>
                <Component {...pageProps} />
            </QueryClientProvider>
        </Web3ReactProvider>
    )
}

export default MyApp
