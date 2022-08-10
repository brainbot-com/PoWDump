import { render, screen } from "@testing-library/react";

import { ConnectETHWalletButton } from "./connect-eth-wallet-button";

test('render ConnectETHWalletButton with label "Connect Wallet"', async () => {
  render(<ConnectETHWalletButton />);

  await screen.findByText(/connect wallet/i);
});
