import { useDebugValue } from 'react'
import useSyncExternalStoreExports from 'use-sync-external-store/shim/with-selector'

// Utils
import { deepEquals } from './utils/deep-equals'
import { SYMBOL_STORE } from './utils/constants'

// Types
import type { Store, Selector } from './core'

const useSyncExternalStore =
  useSyncExternalStoreExports.useSyncExternalStoreWithSelector

export const useStore = <T extends Record<string, any>>(
  store: Store<T>,
  selector: Selector<T> = (state) => state
) => {
  if (store.$$store !== SYMBOL_STORE) {
    throw new Error('Provide a valid store for useStore.')
  }

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
    selector,
    deepEquals
  )

  useDebugValue(state)

  return {
    state: state,
    setState: store.setState
  }
}
