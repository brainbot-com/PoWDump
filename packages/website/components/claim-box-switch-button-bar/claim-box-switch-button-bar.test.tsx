import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClaimBoxSwitchButtonBar } from "./commit-box-switch-button-bar";

test("should render CommitBoxSwitchButtonBar", async () => {
  render(<ClaimBoxSwitchButtonBar />);

  const buttonElements = await screen.findAllByRole("button");
  expect(buttonElements).toHaveLength(2);
});

test("should set active item on click", async () => {
  render(<ClaimBoxSwitchButtonBar />);

  const tlToEthButton = await screen.findByText(/tl -> eth/i);
  const ethToTlButton = await screen.findByText(/eth -> tl/i);

  expect(tlToEthButton).toHaveAttribute("aria-label", "active-tl -> eth");
  expect(ethToTlButton).toHaveAttribute("aria-label", "eth -> tl");

  userEvent.click(ethToTlButton);

  expect(tlToEthButton).toHaveAttribute("aria-label", "tl -> eth");
  expect(ethToTlButton).toHaveAttribute("aria-label", "active-eth -> tl");
});
