import type {ReactNode} from "react";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import {NavBar} from "./nav-bar";
import Notification from "./notifications/notifications";

type Props = {
    title: string,
    children: ReactNode
}
export default function Layout({title, children}: Props) {


    return (
        <div className={"background-image"}>
            <Head>
                <title>{title}</title>
                <meta name="description" content="Dump that tokens!" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NavBar />
            <main className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
                {children}
            </main>

            <Notification />
        </div>

    )
}