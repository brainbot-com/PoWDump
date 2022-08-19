import type {ReactNode} from "react";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import {NavBar} from "./nav-bar";

type Props = {
    title: string,
    children: ReactNode
}
export default function Layout({title, children}: Props) {


    return (
        <div className={styles.container}>
            <Head>
                <title>{title}</title>
                <meta name="description" content="Dump that tokens!" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <NavBar />
                {children}
            </main>

        </div>

    )
}