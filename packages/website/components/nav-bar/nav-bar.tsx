import React from 'react'

import NetworksDropdown from '../networks-dropdown/networks-dropdown'
import { ConnectWallet } from '../wallet/connect-wallet'
// @ts-ignore
import PowDumpLogo from '../../public/assets/images/POWdump_horizontalbwlogo.png'

function NavBar({ titleClickable = false }: { titleClickable?: boolean }) {
  return (
    <nav className={'bg-rich-black'}>
      <div className="container max-w-4xl mx-auto h-20 flex flex-row items-center justify-between">
        <div className="text-white">
          {titleClickable ? (
            <a href={'/'}>
              <img src={PowDumpLogo} alt="logo" style={{ height: '60px' }} />
            </a>
          ) : (
            <img src={PowDumpLogo} alt="logo" style={{ height: '60px' }} />
          )}
        </div>

        <div className="flex-1 flex justify-end items-center">
          <div className={'mr-3'}>
            <NetworksDropdown />
          </div>

          <ConnectWallet />
        </div>
      </div>
    </nav>
  )
}

export { NavBar }
