import React from 'react'
import {formatEther} from "ethers/lib/utils";

type Props = {
  ethPoW: string
  ethPoS: string
}
export const Deal = ({ ethPoW, ethPoS }: Props) => {
  return (
    <div className={"text-center"}>
      Selling <span className={'bg-yellow px-1 py-1 rounded-md text-black font-bold'}>{formatEther(ethPoW)}</span> PoW ETH for{' '}
      <span className={'bg-green px-1 py-1 rounded-md text-black font-bold'}>{formatEther(ethPoS)}</span> ETH
    </div>
  )
}
