import React from "react";

export const CurrencyBadge = ({icon, name}: { icon: string, name: string }) => {
    return (
        <div className={"flex flex-row content-center items-center"}>
            <img src={icon}
                 alt={"currency icon"}
                 style={{height: "20px"}}
                 className={"mr-1"}/>
            <span className={"text-white"}>{name}</span>
        </div>)
}