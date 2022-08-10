import React from "react";

import { NavBarSwitchButtonBar } from "../nav-bar-switch-button-bar";
import { ConnectETHWalletButton } from "../connect-eth-wallet-button";

function NavBar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto h-20 flex flex-row items-center justify-between">
        <div className="font-semibold flex-1">Dump that!</div>
        <div className="flex-1 flex justify-center">
          <NavBarSwitchButtonBar />
        </div>
        <div className="flex-1 flex justify-end">
          <ConnectETHWalletButton />
        </div>
      </div>
    </nav>
  );
}

export { NavBar };
