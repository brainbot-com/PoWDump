import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {defaultClaimPeriodInSec} from "./constants";

export type NotificationType = {
  type: 'error' | 'success' | 'info' | 'warning'
  title: string
  description: string
}

type FormType = {
  ethPoWAmount: string
  signed: boolean
  termsAccepted: boolean
  complete: boolean
  isCommitting: boolean
  txHash: string
}

export type SubgraphCommitment = {
  id: string
  hashedSecret: string
  proof: string
  initiator: string
  recipient: string
  endTimeStamp: string
  value: string
  expectedAmount: string
  emptied: boolean
  refunded: boolean
}
export type Commitisch = Omit<SubgraphCommitment, 'id' | 'proof' | 'emptied' | 'refunded'> & {
  id?: string
  proof?: string
  emptied?: boolean
  refunded?: boolean
}

type SwapSettings = {
    claimPeriodInSec: number
}

type Store = {
  notification: NotificationType | null
  setNotification: (newErrorForNotification: NotificationType) => void
  suggestedPrice: number
  setSuggestedPrice: (newPrice: number) => void
  swapSettings: SwapSettings
  updateSwapSetting: (key: keyof SwapSettings, value: any) => void
  resetSwapSettings: () => void
  priceFromAPI: number
  setPriceFromAPI: (newPriceFromAPI: number) => void
  userPrice: string
  setUserPrice: (newUserPrice: string) => void
  form: FormType
  setForm: (newForm: FormType) => void
  updateFormValue: (key: keyof FormType, value: any) => void
  resetForm: () => void
  txSecrets: { [txHash: string]: string }
  setTxSecrets: (txHash: string, secret: string) => void
  deleteTxSecrets: (txHash: string) => void
  swapSecrets: { [swapId: string]: string }
  setSwapSecrets: (swapId: string, secret: string) => void
  deleteSwapSecrets: (swapId: string) => void
  processingCommitment: null | Commitisch
  setProcessingCommitment: (newProcessingCommitment: null | Commitisch) => void
}

const defaultForm: FormType = {
  ethPoWAmount: '',
  signed: false,
  termsAccepted: false,
  complete: false,
  isCommitting: false,
  txHash: '',
}

const defaultSwapSettings: SwapSettings = {
  claimPeriodInSec: defaultClaimPeriodInSec,
}

export const useStore = create<Store>()(
  devtools(
    persist(
      set => ({
        notification: null,
        form: defaultForm,
        setForm: (newForm: FormType) => set({ form: newForm }, false, { type: 'setForm' }),
        updateFormValue: (key: keyof FormType, value: any) =>
          set(
            state => ({
              form: {
                ...state.form,
                [key]: value,
              },
            }),
            false,
            { type: 'updateFormValue' }
          ),
        resetForm: () =>
          set(
            {
              form: defaultForm,
            },
            false,
            { type: 'resetForm' }
          ),
        setNotification: (newErrorForNotification: NotificationType) =>
          set({ notification: newErrorForNotification }, false, { type: 'setNotification' }),
        suggestedPrice: 0,
        setSuggestedPrice: (newPrice: number) =>
          set({ suggestedPrice: newPrice }, false, { type: 'setSuggestedPrice' }),
        priceFromAPI: 0,
        setPriceFromAPI: (newPriceFromAPI: number) =>
          set({ priceFromAPI: newPriceFromAPI }, false, { type: 'setPriceFromAPI' }),
        userPrice: '',
        setUserPrice: (newPrice: string) => set({ userPrice: newPrice }, false, { type: 'setUserPrice' }),

        txSecrets: {},
        setTxSecrets: (txHash: string, secret: string) =>
          set(
            state => ({
              txSecrets: {
                ...state.txSecrets,
                [txHash]: secret,
              },
            }),
            false,
            { type: 'setTxSecrets', txHash, secret }
          ),
        deleteTxSecrets: (txHash: string) =>
          set(
            state => {
              const stateToUpdate = { ...state.txSecrets }
              delete stateToUpdate[txHash]
              return { txSecrets: stateToUpdate }
            },
            false,
            { type: 'deleteTxSecrets', txHash }
          ),
        swapSecrets: {},
        setSwapSecrets: (swapId: string, secret: string) =>
          set(
            state => ({
              swapSecrets: {
                ...state.swapSecrets,
                [swapId]: secret,
              },
            }),
            false,
            { type: 'setSwapSecrets', swapId, secret }
          ),
        deleteSwapSecrets: (swapId: string) =>
          set(
            state => {
              const stateToUpdate = { ...state.swapSecrets }
              delete stateToUpdate[swapId]
              return { swapSecrets: stateToUpdate }
            },
            false,
            { type: 'setSwapSecrets', swapId }
          ),
        processingCommitment: null,
        setProcessingCommitment: (newProcessingCommitment: null | Commitisch) =>
          set({ processingCommitment: newProcessingCommitment }, false, {
            type: 'setProcessingCommitment',
            processingCommitment: newProcessingCommitment,
          }),
        swapSettings: defaultSwapSettings,
        updateSwapSetting: (key: keyof SwapSettings, value: any ) =>
          set(
            state => ({
              swapSettings: {
                ...state.swapSettings,
                [key]: value,
              },
            }),
            false,
            { type: 'updateSwapSetting' }
          ),
        resetSwapSettings: () =>
          set(
            {
              form: defaultForm,
            },
            false,
            { type: 'resetForm' }
          ),
      }),
      {
        name: 'swapState',

        partialize: state =>
          Object.fromEntries(
            Object.entries(state).filter(([key]) => !['notification', 'processingCommitment', 'form'].includes(key))
          ),
      }
    ),
    {
      name: 'swapState',
    }
  )
)
