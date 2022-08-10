import React from "react";

import { Button } from "../button";

import useWeb3Modal from "../../hooks/useWeb3Modal";
import { useStore } from "../../store";

function ConnectETHWalletButton() {
  const { provider, loadWeb3Modal, logoutOfWeb3Modal } = useWeb3Modal({
    autoLoad: true,
  });

  const connectedETHAddress = useStore((state) => state.connectedETHAddress);

  return (
    <Button
      buttonType="primary"
      onClick={async () => {
        if (provider) {
          await logoutOfWeb3Modal();
        } else {
          await loadWeb3Modal();
        }
      }}
    >
      {connectedETHAddress ? "Disconnect" : "Connect"} Wallet
    </Button>
  );
}

export { ConnectETHWalletButton };
