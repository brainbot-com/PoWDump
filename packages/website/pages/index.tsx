import type {NextPage} from 'next'

import Layout from "../components/layout";
import {DumpBox} from "../components/dump-box";

const Home: NextPage = () => {

    return (
        <Layout title={'PoWDump'}>
            <DumpBox/>
        </Layout>

    )
}

export default Home
