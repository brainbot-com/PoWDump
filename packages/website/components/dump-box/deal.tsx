import React from 'react'

type Props = {
  ethPoW: string
  ethPoS: string
}
export const Deal = ({ ethPoW, ethPoS }: Props) => {
  return (
    <div>
      Selling <span className={'bg-yellow px-1 py-1 rounded-md text-black font-bold'}>{ethPoW}</span> PoW ETH for{' '}
      <span className={'bg-green px-1 py-1 rounded-md text-black font-bold'}>{ethPoS}</span> ETH
    </div>
  )
}
