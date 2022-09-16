import type {NextPage} from 'next'
import Head from "next/head";
import {NavBar} from "../components/nav-bar";

const Home: NextPage = () => {

    return (
        <div className={"background-image"}>
            <Head>
                <title>PoWDump - Terms & Conditions</title>
                <meta name="description"
                      content="PoWDump is a simple DApp that lets PoW ETH sellers create atomic cross-chain swaps."/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <NavBar titleClickable={true}/>
            <main className={"max-w-md mx-auto mt-10 pb-10"}>
                <h2 className={"text-xl font-bold"}>Terms & Conditions of Use</h2><br/>


                <p className={"mt-5"}><span className={"font-bold"}>1. Scope</span><br/><br/>

                    <span className={"font-bold"}>1.1.</span><br/>
                    These terms and conditions govern the contractual relationship between the user and Brainbot
                    Technologies AG (hereinafter referred to as “BBT”) regarding the use of the front end interface
                    which
                    BBT published under <a className="underline"
                                           href={"https://github.com/brainbot-com/PoWDump"}>https://github.com/brainbot-com/PoWDump</a> via
                    the website <a className="underline" href={"https://pow.dump.today"}>https://pow.dump.today</a>
                    (hereinafter referred to as “App”) interfacing with the smart contracts deployed by a third party on
                    Ethereum Mainnet (chainID 1) and Ethereum POW (chainID 10001) at addresses
                    0xdC8C99452DfCC0eD0574cfaA52f5CB90c8F8131C and 0xdC7650c7562E53115eDB02cCC7bf67FB9F79cfF4.
                    BBT and the user are collectively referred to as the “parties“.</p>
                <p className={"mt-5"}><span className={"font-bold"}>1.2.</span><br/>
                    There are no verbal side agreements between the parties. These terms and conditions apply
                    exclusively.</p>
                <p className={"mt-5"}><span className={"font-bold"}>2. Conclusion of the contract</span><br/>

                    The contract between the parties is concluded when the user accesses the App.</p>

                <p className={"mt-5"}><span className={"font-bold"}>3. Right of withdrawal</span><br/>

                    There is no right of withdrawal. However, the user is free at any time to delete or uninstall the
                    App
                    from the device used and/or to delete its browser cache and thus delete the accessed version of the
                    App.</p>
                <p className={"mt-5"}><span className={"font-bold"}>4. Access to the App</span><br/><br/>

                    <span className={"font-bold"}>4.1.</span><br/>
                    The App can be accessed via <a className="underline"
                                                   href={"https://pow.dump.today"}>https://pow.dump.today</a>.
                </p>
                <p className={"mt-5"}><span className={"font-bold"}>4.2.</span><br/>
                    The source code is available via <a className="underline"
                                                        href={"https://github.com/brainbot-com/PoWDump"}>https://github.com/brainbot-com/PoWDump</a>.
                    Any installation of the
                    App is
                    not part of the contract.</p>
                <p className={"mt-5"}><span className={"font-bold"}>4.3.</span><br/>
                    The user may be offered updates of the App for download, which may contain bug fixes and new
                    functionalities as long as the download offer is not discontinued. BBT therefore recommends regular
                    updates.</p>
                <p className={"mt-5"}><span className={"font-bold"}>4.4.</span><br/>
                    BBT is free to stop all access to download and update offers of the App via its web servers at any
                    time.</p>


                <p className={"mt-5"}><span className={"font-bold"}>5. Rights of use</span><br/><br/>

                    <span className={"font-bold"}>5.1.</span><br/>
                    The user may use the App on any number of computers for any lawful purposes.</p>
                <p className={"mt-5"}><span className={"font-bold"}>5.2.</span><br/>
                    The user may acquire further usage rights to the App from the respective rights holders by
                    concluding
                    separate licence agreements with these rights holders under the conditions of the respective
                    licence.
                    The licence texts are included in the source code. In this case, the use of the App is not covered
                    by
                    this contract, but is based solely on the conditions of the respective licence. If several licences
                    are
                    used, these are contained in the source code that is accessible to the user in accordance with
                    Section 4
                    (2).</p>
                <p className={"mt-5"}><span className={"font-bold"}>6. Remuneration</span><br/><br/>

                    The user receives and can use/interact with the App free of charge. Fees may be applied by other
                    participants of the network for certain interactions.</p>
                <p className={"mt-5"}><span className={"font-bold"}>7. Beta Version/Disclaimer/Liability</span><br/>

                    The App is a beta version of experimental open source software released as a beta version under the
                    MIT
                    licence (available here: <a className="underline"
                                                href={"https://github.com/brainbot-com/PoWDump/blob/main/LICENSE"}>https://github.com/brainbot-com/PoWDump/blob/main/LICENSE</a>)
                    and may contain
                    errors and/or bugs. No guarantee or representation whatsoever is made regarding its suitability (or
                    its
                    use) for any purpose or regarding its compliance with any applicable laws and regulations. Use of
                    the
                    App is at the user’s risk and discretion and by using the App the user warrants and represents to
                    have
                    read this disclaimer, understand its contents, assume all risk related thereto and hereby releases,
                    waives, discharges and covenants not to hold liable BBT or any of its officers, employees or
                    affiliates
                    from and for any direct or indirect damage resulting from the App or the use thereof. Such to the
                    extent
                    as permissible by applicable laws and regulations.</p>
                <p className={"mt-5"}><span className={"font-bold"}>8. Third Party Services</span><br/>

                    The App gives the user the choice to interact directly with web services provided by third parties.
                    These web services are unaffiliated with BBT and carried out solely on the discretion of the user
                    and
                    based on the respective terms and conditions agreed between the user and the third party or web
                    service.
                    BBT does not receive any form of remuneration or inducement from these third parties. BBT gives
                    neither
                    express or implied representations nor express or implied warranties with regard to the applications
                    or
                    the services provided by third parties. This includes but is not limited to the validity of the
                    licence,
                    suitability, quality, functionality, availability, access of/to the application or service. BBT
                    therefore cannot be held responsible or liable for these applications or services or for any damages
                    related to using these applications or services.</p>
                <p className={"mt-5"}><span className={"font-bold"}>9. Applicable law</span><br/>

                    The contractual relationship between the parties and all disputes that arise from or in connection
                    with
                    this contractual relationship are subject to the law of Germany. If the user is a consumer and does
                    not
                    have his habitual residence in Germany, the statutory regulations for consumer protection in the
                    state
                    of his habitual residence remain unaffected, if and to the extent that these regulations may not be
                    deviated from under the law of the state of his habitual residence. The United Nations Convention on
                    Contracts for the International Sale of Goods does not apply.</p>
                <p className={"mt-5"}><span className={"font-bold"}>10. Place of jurisdiction</span><br/><br/>

                    Insofar as the user is a merchant, legal entity under public law or special fund under public law or
                    has
                    no general place of jurisdiction in Germany, or has moved his domicile or habitual residence outside
                    of
                    Germany after conclusion of the contract, or his domicile or habitual residence is not known at the
                    time
                    the action is brought, the exclusive place of jurisdiction for all disputes arising from and in
                    connection with the contractual relationship between the parties in all these cases is the
                    registered
                    office of BBT.</p>
                <p className={"mt-5"}><span className={"font-bold"}>11. Dispute settlement</span><br/><br/>

                    <span className={"font-bold"}>11.1.</span><br/>
                    The European Commission provides a platform that enables disputes between consumers and businesses
                    to be
                    settled online (OS platform). The OS platform can be reached under the following link:{" "}
                    <a href={"https://ec.europa.eu/consumers/odr"}
                       className={"underline"}>https://ec.europa.eu/consumers/odr</a>. BBTs email address is:
                    contact@brainbot.com.
                </p>
                <p className={"mt-5"}><span className={"font-bold"}>11.2.</span><br/>
                    BBT is not obliged to participate in dispute settlement procedures before consumer arbitration
                    boards.</p>
                <p className={"mt-5"}><span className={"font-bold"}>12. Severability Clause</span><br/>

                    Should one or more provisions of these Terms and Conditions of Use be or become ineffective, this
                    shall
                    not affect the validity of the remaining provisions. The ineffective provisions shall be replaced
                    with
                    effective provisions that match the purpose of those ineffective provisions.</p>


            </main>
        </div>

    )
}

export default Home
