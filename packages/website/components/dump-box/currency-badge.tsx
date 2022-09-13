import React from "react";

export const CurrencyBadge = ({icon, name}: { icon: string, name: string }) => {
    return (
        <div className={"flex flex-row content-center items-center justify-center"}>
            <img src={icon}
                 alt={"currency icon"}
                 style={{height: "18px"}}
                 className={"mr-1"}/>
            <div className={"mt-1"}>{name}</div>
        </div>)
}