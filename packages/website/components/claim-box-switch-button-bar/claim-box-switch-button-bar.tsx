import React from "react";

import { SwitchButtonBar, Item } from "../switch-button-bar";

import { useStore } from "../../store";

const SWITCH_BUTTON_BAR_ITEMS = [
  {
    label: "TL",
    value: "TL",
  },
  {
    label: "ETH",
    value: "ETH",
  },
];

function ClaimBoxSwitchButtonBar() {
  const activeClaimBoxSwitchItem = useStore(
    (state) => state.activeClaimBoxSwitchItem
  );
  const setActiveClaimBoxSwitchItem = useStore(
    (state) => state.setActiveClaimBoxSwitchItem
  );

  const handleClickItem = (item: Item) => {
    setActiveClaimBoxSwitchItem(item.value);
  };

  return (
    <SwitchButtonBar
      items={SWITCH_BUTTON_BAR_ITEMS.map((item) => ({
        ...item,
        onClick: handleClickItem,
        isActive: activeClaimBoxSwitchItem === item.value,
      }))}
      onClickItem={handleClickItem}
    />
  );
}

export { ClaimBoxSwitchButtonBar };
