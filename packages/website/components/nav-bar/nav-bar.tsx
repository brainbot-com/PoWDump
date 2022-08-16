import React from 'react'

import NetworksDropdown from '../networks-dropdown/networks-dropdown'
import { ConnectWallet } from '../wallet/connect-wallet'

function NavBar() {
  return (
    <nav>
      <div className="container mx-auto h-20 flex flex-row items-center justify-between">
        <div className="font-semibold text-white">POWDump</div>

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
