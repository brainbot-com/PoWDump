import { useEffect } from "react";

import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
// import { Box, Button, Text} from '@chakra-ui/react'
import { injected } from "../../utils/connectors";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { formatAddress } from "../../utils/helpers";
import { Button } from "../button";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { ExtendedEther } from "../../utils/ether";
import { useEthBalance } from "../../hooks/useEthBalance";
import { supportedWallets } from "../../constants";
import { ConnectorButton } from "./connector-button";

const ConnectMetamask = () => {
  const {
    chainId,
    account,
    activate,
    deactivate,
    setError,
    active,
    library,
    connector
  } = useWeb3React<Web3Provider>();
  const { balance } = useEthBalance();

  const onClickConnect = async () => {
    try {
      await activate(
        injected,
        error => {
          if (error instanceof UserRejectedRequestError) {
            // ignore user rejected error
            console.log("user refused");
          } else {
            setError(error);
          }
        },
        false
      );
      localStorage.setItem("isWalletConnected", "true");
      localStorage.setItem("connectedWallet", supportedWallets.metamask.key);
    } catch (e) {
      console.log(e);
    }
  };

  const onClickDisconnect = () => {
    try {
      deactivate();
      localStorage.setItem("isWalletConnected", "false");
      localStorage.removeItem("connectedWallet");
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    console.log("use efffect", chainId, account, active, library, connector);
  });


  const formattedBalance = CurrencyAmount.fromRawAmount(
    ExtendedEther.onCreate(1),
    // @ts-ignore
    balance
  ).toFixed(2);

  return (
    <div>
      {active && typeof account === "string" ? (
        <div className={"flex items-center rounded bg-zinc-900 text-white p-1"}>
          <div className={"px-2"}>{`${formattedBalance} ETH`}</div>

          <Button
            className={"bg-zinc-800 font-bold text-white p-1 px-3"}
            onClick={onClickDisconnect}
          >
            {formatAddress(account, 4)}
          </Button>
        </div>
      ) : (
        <div>
          <ConnectorButton
            key={supportedWallets.metamask.key}
            onClick={onClickConnect}
            title={supportedWallets.metamask.name}
            icon={supportedWallets.metamask.icon}
          />
        </div>
      )}
    </div>
  );
};

export default ConnectMetamask;
