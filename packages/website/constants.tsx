// @ts-ignore
import MetamaskSvg from './public/wallets/metamask.svg'
import ConnectMetamask from './components/connectors/metamask'

export const defaultClaimPeriodInSec = 600
export const defaultTransactionDeadlineInSec = 30*60 // 30 minutes

export type supportedWalletTypes = 'metamask'
export const supportedWallets = {
  metamask: { key: 'metamask', name: 'Metamask', icon: MetamaskSvg, connector: <ConnectMetamask /> },
}
