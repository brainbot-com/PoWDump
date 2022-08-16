import MetamaskSvg from "./public/wallets/metamask.svg";
import ConnectMetamask from "./components/connectors/metamask";

export const ethPoW = "ethPOW"
export const ethPoS = "ethPOS"

export const networks = {
    "mainnet": {name: 'Ethereum', icon: '/assets/images/ethereum-logo.png'},
    "pow": {name: 'EthPoW', icon: '/assets/images/ethereum-logo.png'},
}

export const defaultClaimPeriodInSec = 600

export type supportedWalletTypes = "metamask"
export const supportedWallets = {
    "metamask" : {key: "metamask", name: 'Metamask', icon: MetamaskSvg, connector: <ConnectMetamask/>}
}