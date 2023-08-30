import { useRef } from 'react'
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
  selector: Selector<T> | null = (state) => state,
  silect = false
): [Partial<T>, Store<T>['setState']] => {
  if (store.$$store !== SYMBOL_STORE) {
    throw new Error('Provide a valid store for useStore.')
  }

  if (selector === null) {
    selector = (state) => state
    silect = true
  }

  const silentState = useRef((): Store<T>['getState'] => {
    const state = store.getState()

    return () => state
  })

  const state: T = useSyncExternalStore(
    store.subscribe,
    silect ? silentState.current() : store.getState,
    silect ? silentState.current() : store.getServerState || store.getState,
    selector,
    deepEquals
  )

  return [state, store.setState]
}
