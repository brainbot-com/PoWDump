import type {NextPage} from 'next'
import Head from "next/head";
import {NavBar} from "../components/nav-bar";

const Home: NextPage = () => {

    return (
        <div className={"background-image"}>
            <Head>
                <title>PoWDump - Terms & Conditions</title>
                <meta name="description" content="PoWDump is a simple DApp that lets PoW ETH sellers create atomic cross-chain swaps."/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <NavBar titleClickable={true}/>
            <main className={"max-w-md mx-auto mt-10"}>
                <h2 className={"text-xl font-bold"}>DISCLAIMER</h2>

                <p className={"mt-5 font-bold"}>
                    This DApp is a version of experimental open source software released as a beta version under an <a
                    href={"https://github.com/brainbot-com/PoWDump/blob/main/LICENSE"}>MIT
                    license MIT</a> and may contain errors and/or
                    bugs. No guarantee or representation whatsoever is made regarding its suitability (or its use) for
                    any purpose or regarding its compliance with any applicable laws and regulations.
                    Use of the App is at the user’s risk and discretion and by using the App the user warrants and
                    represents to have read this disclaimer, understand its contents, assume all risk related thereto
                    and hereby releases, waives, discharges and covenants not to hold liable the the developers, hosts,
                    publishers or any of their officers, employees or affiliates from and for any direct or indirect
                    damage resulting from this DApp or the use thereof. Such to the extent as permissible by applicable
                    laws and regulations.
                </p>
                <p className={"mt-5"}>
                    <span className={"font-bold"}>Third Party Services</span><br/>

                    This DApp gives the user the choice to interact directly with web services provided by third
                    parties. These web services are unaffiliated with the developers, hosts, publishers of this DApp and
                    carried out solely on the discretion of the user and based on the respective terms and conditions
                    agreed between the user and the third party or web service. No one other than those third parties
                    receives any form of remuneration or inducement from these third parties and gives neither express
                    or implied representations nor express or implied warranties with regard to the applications or the
                    services provided by third parties. This includes but is not limited to the validity of the license,
                    suitability, quality, functionality, availability, access of/to the application or service.
                </p>


            </main>
        </div>

    )
}

export default Home
