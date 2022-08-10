import React from "react";

import { SwitchButtonBar, Item } from "../switch-button-bar";

import { useStore } from "../../store";

const SWITCH_BUTTON_BAR_ITEMS = [
  {
    label: "TL -> ETH",
    value: "tlToEth",
  },
  {
    label: "ETH -> TL",
    value: "ethToTl",
  },
];

function CommitBoxSwitchButtonBar() {
  const activeCommitBoxSwitchItem = useStore(
    (state) => state.activeCommitBoxSwitchItem
  );
  const setActiveCommitBoxSwitchItem = useStore(
    (state) => state.setActiveCommitBoxSwitchItem
  );

  const handleClickItem = (item: Item) => {
    setActiveCommitBoxSwitchItem(item.value);
  };

  return (
    <SwitchButtonBar
      items={SWITCH_BUTTON_BAR_ITEMS.map((item) => ({
        ...item,
        onClick: handleClickItem,
        isActive: activeCommitBoxSwitchItem === item.value,
      }))}
      onClickItem={handleClickItem}
    />
  );
}

export { CommitBoxSwitchButtonBar };
