import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { NavBarSwitchButtonBar } from './nav-bar-switch-button-bar'

test('should render NavBarSwitchButtonBar with first item as active', async () => {
  render(<NavBarSwitchButtonBar />)

  const buttonElements = await screen.findAllByRole('button')
  expect(buttonElements).toHaveLength(3)

  const commitButton = await screen.findByText(/commit/i)
  expect(commitButton).toHaveAttribute('aria-label', 'active-commit')

  await screen.findByText(/claim/i)
  await screen.findByText(/history/i)
})

test('should set clicked item as active', async () => {
  render(<NavBarSwitchButtonBar />)

  const claimButton = await screen.findByText(/claim/i)
  const commitButton = await screen.findByText(/commit/i)

  expect(commitButton).toHaveAttribute('aria-label', 'active-commit')

  userEvent.click(claimButton)

  expect(claimButton).toHaveAttribute('aria-label', 'active-claim')
  expect(commitButton).toHaveAttribute('aria-label', 'commit')
})
