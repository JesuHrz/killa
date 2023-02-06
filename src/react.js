import { useDebugValue } from 'react'
import useSyncExternalStoreExports from 'use-sync-external-store/shim/with-selector'
import { deepEquals } from './utils/deep-equals'
import { SYMBOL_STORE } from './utils/constants'

const useSyncExternalStore = useSyncExternalStoreExports.useSyncExternalStoreWithSelector

const _selector = (state) => state

export const useStore = (store, selector = _selector) => {
  if (store.STORE !== SYMBOL_STORE) throw new Error('Provide a store valid for killa.')

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
    selector,
    deepEquals
  )

  useDebugValue(state)

  return {
    state,
    setState: store.setState
  }
}
