import { useDebugValue } from 'react'
import UseSyncExternalStoreShim from 'use-sync-external-store/shim/with-selector.js'

// Utils
import { deepEquals } from 'killa/deep-equals'
import { SYMBOL_STORE } from 'killa/constants'

// Types
import type { Store, Selector } from 'killa/core'

const useSyncExternalStore =
  UseSyncExternalStoreShim.useSyncExternalStoreWithSelector

export const useStore = <T extends Record<string, any>>(
  store: Store<T>,
  selector: Selector<T> = (state) => state
): [Partial<T>, Store<T>['setState']] => {
  if (store.$$store !== SYMBOL_STORE) {
    throw new Error('Provide a valid store for useStore.')
  }

  const state: T = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getServerState || store.getState,
    selector,
    deepEquals
  )

  useDebugValue(state)

  return [state, store.setState]
}
