// @ts-ignore
import LoaderSvg from '../../public/assets/tail-spin.svg'
import React from 'react'

export function Loader() {
  return (
    <div className={'flex flex-row justify-center'}>
      <img src={LoaderSvg} alt="Loader icon" className={'w-12 flex'} />
    </div>
  )
}
