import React from 'react'
import { CustomDecimalInput, InputProps } from './custom-decimal-input'

type Props = InputProps & {
  append: React.ReactNode
}

export function InputRow(props: Props) {
  let inputProps = {
    type: props.type,
    id: props.id,
    value: props.value,
    placeholder: props.placeholder,
    disabled: props.disabled,
  }

  if (props.pattern) {
    // @ts-ignore
    inputProps.pattern = props.pattern
  }

  return (
    <div className="w-full">
      <div className="group flex-col rounded-md bg-brown-orange pt-2 border border-1 border-transparent hover:border-gray focus-within:border-gray">
        <div className="flex flex-row mt-2">
          <div className={'flex-1 '}>
            <CustomDecimalInput
              className="w-full appearance-none outline-none dark:bg-brown-orange text-2xl text-white ml-4 mt-2 group-hover:text-white "
              onChangeInputValue={value => {
                props.onChangeInputValue(value)
              }}
              {...inputProps}
            />
          </div>

          {props.append && (
            <div className={'justify-center items-center flex mr-3 p-1'}>
              <span className={'px-2 py-1'}>{props.append}</span>
            </div>
          )}
        </div>
        <div className={'error'}>&nbsp;</div>
      </div>
    </div>
  )
}
