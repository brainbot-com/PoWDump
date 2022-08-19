import React from 'react'

type Props = {
  id: string
  label: string
  value: string
  onChangeInputValue: (changedInputValue: string) => void
  type?: string
  withScanButton?: boolean
  onClickScanButton?: () => void
  min?: string | number
  max?: string | number
}

function LabeledInput(props: Props) {
  return (
    <div className="flex flex-col w-full">
      <label htmlFor={props.id}>{props.label}</label>
      <div className="flex flex-row border border-gray-200 mt-2">
        <input
          className="px-4 py-2 flex-1"
          type={props.type}
          id={props.id}
          value={props.value}
          onChange={event => props.onChangeInputValue(event.target.value)}
          min={props.min}
          max={props.max}
        />
        {props.withScanButton && (
          <button className="flex flex-row items-center justify-center px-4" onClick={props.onClickScanButton}>
            Scan
          </button>
        )}
      </div>
    </div>
  )
}

export { LabeledInput }
