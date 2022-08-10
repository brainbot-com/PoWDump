import { useCallback, useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";


import dynamic from 'next/dynamic';

// const { default: Web3Modal } = await import("./web3modal");

// Web3Modal also supports many other wallets.
// You can see other options at https://github.com/Web3Modal/web3modal
let web3Modal
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: config.NETWORK,
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: config.INFURA_KEY,
        },
      },
    },
  });
}

// const WalletConnectProvider = dynamic(()=>{return import("@walletconnect/web3-provider").WalletConnectProvider}, {ssr: false});
// const Web3Modal = dynamic(()=>{return import("web3modal")}, {ssr: false});

import { useStore } from "../store";
import config from "../config";


function useWeb3Modal(
  modalConfig: {
    autoLoad?: boolean;
  } = {}
) {

  const [provider, setProvider] = useState<null | Web3Provider>(null);

  const setConnectedETHAddress = useStore(
    (state) => state.setConnectedETHAddress
  );

  const [autoLoaded, setAutoLoaded] = useState(false);
  const { autoLoad = true } = modalConfig;

  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {
    const newProvider = await web3Modal.connect();
    const web3Provider = new Web3Provider(newProvider);
    setProvider(web3Provider);

    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    setConnectedETHAddress(address);
  }, [setConnectedETHAddress]);

  const logoutOfWeb3Modal = useCallback(
    async function() {
      await web3Modal.clearCachedProvider();
      window.location.reload();
      setConnectedETHAddress(null);
    },
    [setConnectedETHAddress]
  );

  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  useEffect(() => {
    if (autoLoad && !autoLoaded && web3Modal.cachedProvider) {
      loadWeb3Modal();
      setAutoLoaded(true);
    }
  }, [autoLoad, autoLoaded, loadWeb3Modal, setAutoLoaded]);

  return { provider, loadWeb3Modal, logoutOfWeb3Modal };

  // return {provider: null, loadWeb3Modal: null, logoutOfWeb3Modal: null}
}

export default useWeb3Modal;
