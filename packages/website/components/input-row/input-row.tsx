import React from "react";

type Props = {
    type: string,
    id: string,
    value: string,
    placeholder: string,
    append: React.ReactNode,
    onChangeInputValue: (value: string) => void,
    pattern?: string,
}

export function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export function InputRow(props: Props) {
    // const pattern = props.pattern ? `pattern=${props.pattern}` : "";

    let inputProps = {
        type: props.type,
        id: props.id,
        value: props.value,
        placeholder: props.placeholder,
    }

    if (props.pattern) {
        // @ts-ignore
        inputProps.pattern = props.pattern;
    }

    const enforcer = (nextUserInput: string) => {
        if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
            props.onChangeInputValue(nextUserInput)
        }
    }

    return (
        <div className="w-full">
            <div className="flex flex-col rounded-lg dark:bg-zinc-800 pt-2">
                <div className="flex flex-row mt-2">
                    <div className={"flex-1 items-center p-2"}>
                        <input
                            className="w-full appearance-none outline-none dark:bg-zinc-800 text-2xl"

                            onChange={(event) => {
                                enforcer(event.target.value.replace(/,/g, '.'))
                            }}



                            // universal input options
                            inputMode="decimal"
                            autoComplete="off"
                            autoCorrect="off"

                            minLength={1}
                            maxLength={79}
                            spellCheck="false"

                            {...inputProps}
                        />
                    </div>

                    {props.append && (
                        <div className={"justify-center items-center flex mr-3 p-1"}>
                            <span className={"bg-zinc-700 rounded rounded-lg px-2 py-1"}>

                            {props.append}
                            </span>
                        </div>)}

                </div>
                <div className={"error"}>
                    &nbsp;
                </div>
            </div>
        </div>
    );
}