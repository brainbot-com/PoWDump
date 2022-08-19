import create from 'zustand'

export type ActiveNavBarSwitchItem = 'commit' | 'claim' | 'history'

export type ethPoW = 'ethPoW'
export type ethPoS = 'ethPoS'
export type ActiveCommitBoxSwitchItem = ethPoW | ethPoS
export type ActiveClaimBoxSwitchItem = ethPoW | ethPoS

export type NotificationType = {
  type: 'error' | 'success' | 'info' | 'warning',
  title: string,
  description: string,
}
type Store = {
  connectedETHAddress: null | string
  setConnectedETHAddress: (newConnectedETHAddress: null | string) => void
  activeNavBarSwitchItem: ActiveNavBarSwitchItem
  setActiveNavBarSwitchItem: (newActiveNavBarSwitchItem: ActiveNavBarSwitchItem) => void
  activeCommitBoxSwitchItem: ActiveCommitBoxSwitchItem
  setActiveCommitBoxSwitchItem: (newActiveCommitBoxSwitchItem: ActiveCommitBoxSwitchItem) => void
  activeClaimBoxSwitchItem: ActiveClaimBoxSwitchItem
  setActiveClaimBoxSwitchItem: (newActiveClaimBoxSwitchItem: ActiveClaimBoxSwitchItem) => void,
  notification: NotificationType | null,
  setNotification: (newErrorForNotification: NotificationType) => void
}

export const useStore = create<Store>(set => ({
  connectedETHAddress: null,
  setConnectedETHAddress: (newConnectedETHAddress: null | string) =>
    set({ connectedETHAddress: newConnectedETHAddress }),
  activeNavBarSwitchItem: 'commit',
  setActiveNavBarSwitchItem: (newActiveNavBarSwitchItem: ActiveNavBarSwitchItem) =>
    set({ activeNavBarSwitchItem: newActiveNavBarSwitchItem }),
  activeCommitBoxSwitchItem: 'ethPoW',
  setActiveCommitBoxSwitchItem: (newActiveCommitBoxSwitchItem: ActiveCommitBoxSwitchItem) =>
    set({ activeCommitBoxSwitchItem: newActiveCommitBoxSwitchItem }),
  activeClaimBoxSwitchItem: 'ethPoW',
  setActiveClaimBoxSwitchItem: (newActiveClaimBoxSwitchItem: ActiveClaimBoxSwitchItem) =>
    set({ activeClaimBoxSwitchItem: newActiveClaimBoxSwitchItem }),
  notification: null,
  setNotification: (newErrorForNotification: NotificationType) => set({ notification: newErrorForNotification })
}))
