import type {NextPage} from 'next'

import Layout from "../components/layout";
import {DumpBox} from "../components/dump-box";

const Home: NextPage = () => {

    return (
        <Layout title={'PoWDump'}>
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
