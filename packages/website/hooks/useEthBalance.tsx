import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'

export function useEthBalance() {
  const [balance, setBalance] = useState(BigNumber.from(0))

  const { account, provider } = useWeb3React<Web3Provider>()

  useEffect(() => {
    if (provider && account) {
      provider.getBalance(account).then(result => {
        setBalance(result)
      })
    }
  }, [provider, account])

  return { balance }
}
