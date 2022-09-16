import type { ReactNode } from 'react'
import Head from 'next/head'
import { NavBar } from './nav-bar'
import Notification from './notifications/notifications'
import dynamic from 'next/dynamic'

const HowItWorks = dynamic<{}>(() => import('../components/help').then(mod => mod.HowItWorks), {
  ssr: false,
})
type Props = {
  title: string,
  children: ReactNode
}
export default function Layout({ title, children }: Props) {

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
                  Powdump provides access to powchains and smart contracts deployed by third parties and
                  is meant to be an information aggregation application.
                </p>
                <p className={'mt-2'}>
                  <a className={'underline'} href={'https://dump.today/imprint'}>Imprint</a>
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