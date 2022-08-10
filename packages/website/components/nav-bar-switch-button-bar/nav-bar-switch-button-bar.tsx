import React from "react";

import { SwitchButtonBar, Item } from "../switch-button-bar";
import { useRouter } from 'next/router'

import { useStore } from "../../store";

const SWITCH_BUTTON_BAR_ITEMS = [
  {
    label: "Dump",
    value: "dump",
  },
  {
    label: "Claim",
    value: "claim",
  },
  {
    label: "History",
    value: "history",
  },
];

function NavBarSwitchButtonBar() {
  const router = useRouter()
  const activeNavBarSwitchItem = useStore(
    (state) => state.activeNavBarSwitchItem
  );
  const setActiveNavBarSwitchItem = useStore(
    (state) => state.setActiveNavBarSwitchItem
  );

  const handleClickItem = (item: Item) => {
    router.push(item.value)
    setActiveNavBarSwitchItem(item.value);
  };

  return (
    <SwitchButtonBar
      items={SWITCH_BUTTON_BAR_ITEMS.map((item) => ({
        ...item,
        isActive: activeNavBarSwitchItem === item.value,
      }))}
      onClickItem={handleClickItem}
    />
  );
}

export { NavBarSwitchButtonBar };
