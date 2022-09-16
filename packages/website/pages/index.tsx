import type {NextPage} from 'next'

import Layout from "../components/layout";
import dynamic from "next/dynamic";
import {useEffect} from "react";
import {useStore} from "../store";

const DumpBox = dynamic<{}>(() => import('../components/dump-box').then(mod => mod.DumpBox), {
    ssr: false,
})

const Home: NextPage = () => {
    const processingCommitment = useStore(state => state.processingCommitment)

    useEffect(() => {
        const beforeUnload = (e: BeforeUnloadEvent) => {
            if (processingCommitment) {
                e.preventDefault()

                // return value is useless on modern browsers https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#browser_compatibility
                return e.returnValue = 'It looks like you have some non-complete swaps. Leaving the page would prevent you from completing them. Are you sure you want to leave?'
            }
        }

        window.addEventListener('beforeunload', beforeUnload)

        return () => {
            window.removeEventListener('keydown', beforeUnload);
        };
    }, [processingCommitment])

    return (
        <Layout title={'PoWDump - A PoW ETH dump DApp using cross-chain atomic swaps.'}>
            <>
                <div className={"container mx-auto"}>
                    <div className={"max-w-md mx-auto"}>
                        <DumpBox/>
                    </div>
                </div>
            </>
        </Layout>

    )
}

export default Home
