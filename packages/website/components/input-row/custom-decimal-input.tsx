import React from 'react'

export function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export type InputProps = {
    type: string
    id: string
    value: string
    placeholder: string
    pattern?: string
    className?: string
    disabled?: boolean
    onChangeInputValue: (value: string) => void
}
export const CustomDecimalInput = (props: InputProps) => {
    const {onChangeInputValue, ...rest} = props
    const enforcer = (nextUserInput: string) => {
        if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
            onChangeInputValue(nextUserInput)
        }
    }

    return (
        <input
            onChange={event => {
                enforcer(event.target.value.replace(/,/g, '.'))
            }}
            // universal input options
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            minLength={1}
            maxLength={77}
            spellCheck="false"
            {...rest}
        />
    )
}