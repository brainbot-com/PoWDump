import type {NextPage} from 'next'

import Layout from "../components/layout";
import dynamic from "next/dynamic";

const DumpBox = dynamic<{}>(() => import('../components/dump-box').then(mod => mod.DumpBox), {
    ssr: false,
})


const Home: NextPage = () => {

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
