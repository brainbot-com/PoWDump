import type {ReactNode} from "react";
import Head from "next/head";
import {NavBar} from "./nav-bar";
import Notification from "./notifications/notifications";
import dynamic from "next/dynamic";

const HowItWorks = dynamic<{}>(() => import('../components/help').then(mod => mod.HowItWorks), {
    ssr: false,
})
type Props = {
    title: string,
    children: ReactNode
}
export default function Layout({title, children}: Props) {


    return (
        <div className={"background-image"}>
            <Head>
                <title>{title}</title>
                <meta name="description" content="PoWDump is a simple DApp that lets PoW ETH sellers create atomic cross-chain swaps."/>
                <link rel="icon" href="/favicon.png"/>
            </Head>
            <NavBar/>
            <div className={"relative pb-10"}>
                <main className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
                    {children}
                </main>
                <div className={"static bg-rich-black md:absolute right-0 top-0 h-full w-full md:w-64 text-white"} style={{minHeight: "calc(100vh - 80px)"}}>
                    <ul className={"p-5"}>
                        <li>
                            <a href={"https://dump.today"}>Website</a>
                        </li>
                        <li className={"mt-2"}>
                            <a href={"https://dump.today/faqs"}>FAQ</a>
                        </li>
                    </ul>
                    <div className={"p-2"}>
                        <HowItWorks/>
                    </div>
                </div>
            </div>


            <Notification/>
        </div>

    )
}