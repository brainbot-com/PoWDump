import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'

export function useEthBalance() {
  const [balance, setBalance] = useState(BigNumber.from(0))

  const { account, library } = useWeb3React<Web3Provider>()

  useEffect(() => {
    if (library && account) {
      library.getBalance(account).then(result => {
        setBalance(result)
      })
    }
  }, [library, account])

  return { balance }
}
