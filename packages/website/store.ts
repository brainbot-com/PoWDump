import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export type ActiveNavBarSwitchItem = 'commit' | 'claim' | 'history'

export type ethPoW = 'ethPoW'
export type ethPoS = 'ethPoS'
export type ActiveCommitBoxSwitchItem = ethPoW | ethPoS
export type ActiveClaimBoxSwitchItem = ethPoW | ethPoS

export type NotificationType = {
  type: 'error' | 'success' | 'info' | 'warning'
  title: string
  description: string
}

export type Commitment = {
  id: string
  hashedSecret: string
  recipient: string
  expectedAmount: string
}
type Store = {
  connectedETHAddress: null | string
  setConnectedETHAddress: (newConnectedETHAddress: null | string) => void
  activeNavBarSwitchItem: ActiveNavBarSwitchItem
  setActiveNavBarSwitchItem: (newActiveNavBarSwitchItem: ActiveNavBarSwitchItem) => void
  activeCommitBoxSwitchItem: ActiveCommitBoxSwitchItem
  setActiveCommitBoxSwitchItem: (newActiveCommitBoxSwitchItem: ActiveCommitBoxSwitchItem) => void
  activeClaimBoxSwitchItem: ActiveClaimBoxSwitchItem
  setActiveClaimBoxSwitchItem: (newActiveClaimBoxSwitchItem: ActiveClaimBoxSwitchItem) => void
  notification: NotificationType | null
  setNotification: (newErrorForNotification: NotificationType) => void
  pendingCommitments: { [commitmentId: string]: Commitment }
  setPendingCommitments: (newPendingCommitment: Commitment) => void
  removePendingCommitment: (commitmentId: string) => void
  suggestedPrice: number
  setSuggestedPrice: (newPrice: number) => void
  priceFromAPI: number,
  setPriceFromAPI: (newPriceFromAPI: number) => void
  userPrice: string
  setUserPrice: (newUserPrice: string) => void
}

export const useStore = create<Store>()(
  devtools(
    persist(
      set => ({
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
        setNotification: (newErrorForNotification: NotificationType) => set({ notification: newErrorForNotification }),
        pendingCommitments: {},
        setPendingCommitments: (newPendingCommitment: Commitment) =>
          set(state => {
            const { pendingCommitments } = state
            pendingCommitments[newPendingCommitment.id] = newPendingCommitment
            return { pendingCommitments }
          }),
        removePendingCommitment: (commitmentId: string) =>
          set(state => {
            const { pendingCommitments } = state
            delete pendingCommitments[commitmentId]
            return { pendingCommitments }
          }),
        suggestedPrice: 0,
        setSuggestedPrice: (newPrice: number) => set({ suggestedPrice: newPrice }),
        priceFromAPI: 0,
        setPriceFromAPI: (newPriceFromAPI: number) => set({ priceFromAPI: newPriceFromAPI }),
        userPrice: "",
        setUserPrice: (newPrice: string) => set({ userPrice: newPrice }),
      }),
      {
        name: 'swapState',
        partialize: state =>
          Object.fromEntries(Object.entries(state).filter(([key]) => !['notification'].includes(key))),
      }
    )
  )
)
