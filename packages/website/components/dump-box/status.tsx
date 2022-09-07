import React from "react";

export const Status = ({status}: { status: string | React.ReactNode}) => {
    return (
        <div className={"mt-5 text-center"}>
            <span className={"font-bold"}>Status:</span> {status}
        </div>
    )
}