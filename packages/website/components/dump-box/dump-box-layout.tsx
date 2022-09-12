// @ts-ignore
import PowDumpLogo from "../../public/assets/images/POWdump_Horizontal_logo.png";
import React from "react";

type Props = {
    message?: React.ReactNode | string,
    children: React.ReactNode,
    style?: 'in-progress'
}

export const DumpBoxLayout = ({message, children, style}: Props) => {
    return (
        <div className="container mx-auto">
            <img src={PowDumpLogo} alt={"POWDump logo"} className={"mx-auto pt-5"} style={{width: "300px"}}/>

            {message}
            <div
                className={`max-w-md mx-auto flex flex-col items-center mt-10 rounded-lg
           p-4 shadow-md gap-y-4 ${style === 'in-progress' ? "bg-orange border border-4 border-black text-black" : "bg-rich-black text-white"}  break-words`}

            >
                {children}
            </div>
        </div>
    )
}