import type { ReactNode } from 'react'
import Head from 'next/head'
import { NavBar } from './nav-bar'
import Notification from './notifications/notifications'
import dynamic from 'next/dynamic'
import getConfig from 'next/config'
import Link from 'next/link'
import React from 'react'

const HowItWorks = dynamic<{}>(() => import('../components/help').then(mod => mod.HowItWorks), {
  ssr: false,
})
type Props = {
  title: string,
  children: ReactNode
}
export default function Layout({ title, children }: Props) {
  const { publicRuntimeConfig: { build } } = getConfig()

  return (
    <div className={'background-image'}>
      <Head>
        <title>{title}</title>
        <meta name='description'
              content='PoWDump is a simple DApp that lets PoW ETH sellers create atomic cross-chain swaps.' />
        <link rel='icon' href='/favicon.png' />
      </Head>
      <div>
        <NavBar />
        <div className={'relative pb-10'}>
          <main className={'flex flex-col justify-between  h-full'}>
            <div className={'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 '}>
              {children}
            </div>


          </main>
          <div
            className={'static bg-rich-black md:absolute right-0 top-0 h-full w-full md:w-64 text-white mt-10 md:mt-0'}
            style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className={'flex flex-col justify-between h-full'}>
              <div>
                <ul className={'p-5'}>
                  <li>
                    <a href={'https://dump.today'}>Website</a>
                  </li>
                  <li className={'mt-2'}>
                    <a href={'https://dump.today/faqs'}>FAQ</a>
                  </li>
                  <li className={'mt-2'}>
                    <a href={'https://docs.dump.today'}>Documentation
                    </a>
                  </li>
                </ul>
                <div className={'p-2'}>
                  <HowItWorks />
                </div>
              </div>
              <div className={'text-gray-500 text-xs p-5 mx-auto'}>
                <h5 className={'text-sm'}>Legal</h5>
                <p className={'mt-2'}>
                  This website is meant to solely function as an aggregation application for publicly available
                  information. It provides information for the interaction with smart contracts deployed by third
                  parties on Ethereum (ChainID 1) and EthereumPoW (ChainID 10001). <Link
                  href={'/terms_and_conditions.html'} passHref>
                  <a className={'underline'} target={'_blank'} rel='noreferrer'>Terms & Conditions</a></Link> apply.
                  The user
                  interacts with these scripts directly via his RPC and his separate wallet
                  application.
                </p>
                <p className={'mt-2'}>
                  <a className={'underline'} href={'https://dump.today/imprint'}>Imprint</a> | <Link
                  href={'/terms_and_conditions.html'} passHref>
                  <a className={'underline'} target={'_blank'} rel='noreferrer'>
                    Terms & Conditions
                  </a>
                </Link>
                </p>
                <p className={'mt-2 text-right'}>
                  Build version: {build}
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>

      <Notification />
    </div>

  )
}