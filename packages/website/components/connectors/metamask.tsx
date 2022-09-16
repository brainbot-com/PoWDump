import React, { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { formatAddress } from '../../utils/helpers'
import { Button } from '../button'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { ExtendedEther } from '../../utils/ether'
import { useEthBalance } from '../../hooks/useEthBalance'
import { supportedWallets } from '../../constants'
import { ConnectorButton } from './connector-button'
import { getConnection } from '../../connection/utils'
import { getErrorMessage } from '../../utils/error'
import { useStore } from '../../store'
import { Account } from './account'

const ConnectMetamask = () => {
  const { connector, account } = useWeb3React()
  const { balance } = useEthBalance()
  const setNotification = useStore(state => state.setNotification)
  const connection = getConnection(connector)
  const { useIsActive } = connection.hooks
  const [open, setOpen] = useState(false)

  const active = useIsActive()

  const onClickConnect = async () => {
    try {
      localStorage.setItem('isWalletConnected', 'true')
      localStorage.setItem('connectedWallet', supportedWallets.metamask.key)

      await connector.activate()
    } catch (e) {
      console.log('cannot connect wallet', e)
      setNotification({ type: 'error', title: 'Cannot connect wallet', description: getErrorMessage(e) })
    }
  }

  const onClickDisconnect = () => {
    try {
      if (connector.deactivate) {
        connector.deactivate()
      } else {
        connector.resetState()
      }

      localStorage.setItem('isWalletConnected', 'false')
      localStorage.removeItem('connectedWallet')
    } catch (e) {
      console.log(e)
      setNotification({ type: 'error', title: 'Cannot disconnect wallet', description: getErrorMessage(e) })
    }
  }

  const formattedBalance = CurrencyAmount.fromRawAmount(
    ExtendedEther.onCreate(1),
    // @ts-ignore
    balance
  ).toFixed(2)

  return (
    <div>
      {active && account && (
        <Account
          show={open}
          onClose={setOpen}
          onClick={() => setOpen(false)}
          value={account}
          formattedBalance={formattedBalance}
          onClick1={() => onClickDisconnect()}
        />
      )}

      {active && account ? (
        <div className={'flex items-center rounded-lg bg-gray-500 text-white p-1'}>
          <div className={'px-2'}>{`${formattedBalance} ETH`}</div>

          <Button
            className={'bg-rich-black font-bold text-white p-1 px-3 rounded-lg'}
            onClick={() => {
              setOpen(true)
            }}
          >
            {formatAddress(account, 4)}
          </Button>
        </div>
      ) : (
        <div>
          <ConnectorButton
            connectorKey={supportedWallets.metamask.key}
            onClick={onClickConnect}
            title={supportedWallets.metamask.name}
            icon={supportedWallets.metamask.icon}
          />
        </div>
      )}
    </div>
  )
}

export default ConnectMetamask
