import React, { ButtonHTMLAttributes } from 'react'

type ButtonType = 'primary' | 'secondary' | 'disabled'

function Button(
  props: ButtonHTMLAttributes<{}> & {
    buttonType?: ButtonType
    fullWidth?: boolean
    className?: string
  }
) {
  const { buttonType, fullWidth, className, ...rest } = props

  const buttonTypes = {
    primary: 'px-4 py-2 font-semibold rounded-lg bg-blue-600 text-white',
    secondary: 'px-4 py-2 font-semibold rounded-lg text-black',
    disabled: 'px-4 py-2 font-semibold rounded-lg bg-gray-500 text-white',
  }
  return (
    <button
      {...rest}
      className={`
       
        ${buttonType && buttonTypes[buttonType] ? buttonTypes[buttonType] : ''}
        ${props.disabled ? 'opacity-50' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className ? className : ''}
      `}
    >
      {props.children}
    </button>
  )
}

export { Button }
