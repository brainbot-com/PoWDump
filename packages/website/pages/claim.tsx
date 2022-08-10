import type { NextPage } from 'next'

import Layout from "../components/layout";
import {ClaimBox} from "../components/claim-box";

const Home: NextPage = () => {
    return (
        <Layout title={'Claim'}>
            <ClaimBox />
        </Layout>

    )
}

export default Home
