import type {NextPage} from 'next'

import Layout from "../components/layout";
import {DumpBox} from "../components/dump-box";
import {injected} from "../utils/connectors";
import {useWeb3React} from "@web3-react/core";
import {useEffect} from "react";

const Home: NextPage = () => {
    const {activate} = useWeb3React()


    useEffect(() => {
        const connectWalletOnPageLoad = async () => {
            if (localStorage?.getItem('isWalletConnected') === 'true') {
                try {
                    await activate(injected)
                    localStorage.setItem('isWalletConnected', "true")
                } catch (ex) {
                    console.log(ex)
                }
            }
        }
        connectWalletOnPageLoad()
    }, [])


    return (
        <Layout title={'Create Next App'}>
            <DumpBox/>
        </Layout>

    )
}

export default Home
