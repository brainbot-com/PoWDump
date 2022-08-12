import React from "react";

import { ConnectETHWalletButton } from "../connect-eth-wallet-button";
import NetworksDropdown from "../networks-dropdown/networks-dropdown";

function NavBar() {
  return (
    <nav>
      <div className="container mx-auto h-20 flex flex-row items-center justify-between">
        <div className="font-semibold flex-1 text-white">POWDump</div>

        <div className="flex-1 flex justify-end items-center">
            <div className={"mr-3"}>

                <NetworksDropdown />
            </div>

          <ConnectETHWalletButton />
        </div>
      </div>
    </nav>
  );
}

export { NavBar };
