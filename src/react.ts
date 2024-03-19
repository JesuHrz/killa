import { useRef } from 'react'
import UseSyncExternalStoreShim from 'use-sync-external-store/shim/with-selector.js'

// Utils
import { deepEquals } from 'killa/deep-equals'
import { SYMBOL_STORE } from 'killa/constants'

// Types
import type { Store } from 'killa/core'

const useSyncExternalStore =
  UseSyncExternalStoreShim.useSyncExternalStoreWithSelector

const fallbackSelector = <T, U>(state: T) => state as unknown as U

export const useStore = <T, U>(
  store: Store<T>,
  selector: ((state: T) => U) | null = fallbackSelector,
  silect = false
): [U, Store<T>['setState']] => {
  if (store.$$store !== SYMBOL_STORE) {
    throw new Error('Provide a valid store for useStore.')
  }

  if (selector === null) {
    selector = fallbackSelector
    silect = true
  }

  const silentState = useRef((): Store<T>['getState'] => {
    const state = store.getState()

    return () => state
  })

  const state = useSyncExternalStore(
    store.subscribe,
    silect ? silentState.current() : store.getState,
    silect ? silentState.current() : store.getServerState || store.getState,
    selector,
    deepEquals
  )

  return [state, store.setState]
}
