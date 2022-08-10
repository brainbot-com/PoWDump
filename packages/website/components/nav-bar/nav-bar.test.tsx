import { render, screen } from "@testing-library/react";

import { NavBar } from "./nav-bar";

test("render NavBar with title, switch bar and connect button", async () => {
  render(<NavBar />);

  await screen.findByText(/tl swap/i);
  await screen.findByText(/commit/i);
  await screen.findByText(/claim/i);
  await screen.findByText(/history/i);
  await screen.findByText(/connect wallet/i);

  const buttons = await screen.findAllByRole("button");
  expect(buttons).toHaveLength(4);
});
