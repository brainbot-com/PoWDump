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
    primary: 'px-4 py-2 font-semibold rounded-lg bg-green text-black',
    secondary: 'px-4 py-2 font-semibold rounded-lg text-black',
    disabled: 'px-4 py-2 font-semibold rounded-lg bg-[#454041] text-gray',
  }
  return (
    <button
      {...rest}
      className={`
       
        ${buttonType && buttonTypes[buttonType] ? buttonTypes[buttonType] : ''}
        ${props.disabled ? 'opacity-90' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className ? className : ''}
      `}
    >
        {props.children}
    </button>
  )
}

export { Button }
