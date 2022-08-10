import React from "react";

import { CommitBoxEthPow } from "../commit-box-eth-pow";
import { CommitBoxEthToTl } from "../commit-box-eth-to-tl";

import { useStore } from "../../store";
import {ethPoW} from "../../constants";

function CommitBox() {
  const activeCommitBoxSwitchItem = useStore(
    (state) => state.activeCommitBoxSwitchItem
  );

  return (
    <div className="container mx-auto">
      <div
        className="
          max-w-md mx-auto flex flex-col items-center mt-10 rounded border-gray-200
          border p-4 shadow-md gap-y-4 bg-white
        "
      >
        {/*<CommitBoxSwitchButtonBar />*/}
        {activeCommitBoxSwitchItem === "ethPoW" ? (
          <CommitBoxEthPow />
        ) : (
          <CommitBoxEthToTl />
        )}

          {/*<CommitBoxEthToTl />*/}
      </div>
    </div>
  );
}

export { CommitBox };
