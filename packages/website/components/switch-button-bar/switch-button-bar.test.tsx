import { render, screen } from "@testing-library/react";

import { SwitchButtonBar } from "./switch-button-bar";

test("render 2 buttons", async () => {
  const buttonBarItems = [
    {
      label: "label 1",
      value: "value 1",
    },
    {
      label: "label 2",
      value: "value 2",
    },
  ];

  render(
    <SwitchButtonBar
      items={buttonBarItems}
      onClickItem={() => console.log("clicked")}
    />
  );

  const buttonElements = await screen.findAllByRole("button");
  expect(buttonElements).toHaveLength(buttonBarItems.length);
});
