import {ClipboardDocumentIcon} from "@heroicons/react/24/outline";
import React from "react";

export const CopyToClipboard = ({text}: { text: string }) => {
    const handleClickCopy = async () => {
        await navigator.clipboard.writeText(text)
    }

    return (
        <ClipboardDocumentIcon className={"h-5 w-5 text-black cursor-pointer inline-block"} onClick={handleClickCopy}/>
    )
}