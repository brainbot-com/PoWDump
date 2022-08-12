import React from "react";

import {CommitBoxEthPow} from "../commit-box-eth-pow";
import {CommitBoxEthToTl} from "../commit-box-eth-to-tl";

import {useStore} from "../../store";
import {ethPoW} from "../../constants";

function CommitBox() {
    const activeCommitBoxSwitchItem = useStore(
        (state) => state.activeCommitBoxSwitchItem
    );

    return (
        <div className="container mx-auto">
            <div
                className="
          max-w-md mx-auto flex flex-col items-center mt-10 rounded-lg border-gray-200 dark:border-gray-800
          border p-4 shadow-md gap-y-4 dark:bg-slate-900 text-white dark:text-gray-500
        "
            >
                <div>
                    <div className="font-semibold text-2xl">
                        Dump
                    </div>
                </div>
                {/*<CommitBoxSwitchButtonBar />*/}
                {activeCommitBoxSwitchItem === "ethPoW" ? (
                    <CommitBoxEthPow/>
                ) : (
                    <CommitBoxEthToTl/>
                )}

                {/*<CommitBoxEthToTl />*/}
            </div>
        </div>
    );
}

export {CommitBox};
