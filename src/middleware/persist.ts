import { Store } from '../core'
import { SYMBOL_PERSIST, SYMBOL_STORE } from '../utils/constants'
import {
  addDocumentEvent,
  removeDocumentEvent,
  serialize,
  deserialize,
  merge,
  addWindowEvent,
  removeWindowEvent
} from '../utils/helpers'

/** Killa Storage API interface. */
export interface CustomStorage<T> {
  /**
   * Returns the current value associated with the given key,
   * or null if the given key does not exist.
   **/
  getItem: (name: string) => T | null
  /**
   * Sets the value of the pair identified by key to value, creating a
   * new key/value pair if none existed for key previously.
   */
  setItem: (name: string, value: unknown) => void
  /**
   * Removes the key/value pair with the given key, if a key/value pair with
   * the given key exists.
   */
  removeItem: (name: string) => void
}

export interface PersistConfig<T> {
  /** Storage name (unique) */
  name?: string
  /**
   * @default () => localStorage
   */
  storage?: CustomStorage<T> | (() => CustomStorage<T>)
  merge?: (state: T, persistedState: T) => T
  /**
   * Enable Revalidate mode
   * @default true
   */
  revalidate?: boolean
  /**
   *  Timeout to trigger the revalidate event in milliseconds
   * @default 200
   */
  revalidateTimeout?: number
}

export const normalizeStorage = <T>(storage: () => CustomStorage<T>) => {
  try {
    const _storage = storage()
    if (!_storage) return null

    return {
      getItem: (name) => {
        const value = _storage.getItem(name) as string
        return deserialize<T>(value)
      },
      setItem: (name, value) => _storage.setItem(name, serialize(value)),
      removeItem: (name) => _storage.removeItem(name)
    } as CustomStorage<T>
  } catch (e) {
    return null
  }
}

const validateStorage = <T>(
  storage: CustomStorage<T> | (() => CustomStorage<T>) | null
) => {
  if (typeof storage === 'function') {
    try {
      return storage()
    } catch (error) {
      return null
    }
  }

  return storage
}

export const initRevalidateOnFocus = (listener: () => void) => {
  addWindowEvent('focus', listener)
  addDocumentEvent('visibilitychange', listener)
  return () => {
    removeWindowEvent('focus', listener)
    removeDocumentEvent('visibilitychange', listener)
  }
}

export const persist =
  <T>(config: PersistConfig<T>) =>
  (store: Store<T>) => {
    const baseConfig = {
      name: '',
      storage: normalizeStorage(() => window.localStorage as CustomStorage<T>),
      merge,
      revalidate: true,
      revalidateTimeout: 200,
      ...config
    }
    const storageName = baseConfig.name
    const storage = validateStorage(baseConfig.storage)

    if (store?.$$store !== SYMBOL_STORE) {
      console.error(
        '[Killa Persist] Provide a valid killa store to persist your store.'
      )
      return
    }

    if (!storageName) {
      console.error('[Killa Persist] Provide a name to persist your store.')
      return
    }

    if (!storage) {
      console.error('[Killa Persist] Provide a storage to persist your store.')
      return null
    }

    const _setState = store.setState
    let hydrated = false

    store.setState = (state, force) => {
      _setState(state, force)
      storage?.setItem(storageName, store.getState())
    }

    const hydrate = () => {
      const persistedState = storage?.getItem(storageName)

      store.setState(() => {
        return {
          ...merge<T>(store.getState(), persistedState as T)
        }
      })

      hydrated = true
    }

    if (baseConfig.revalidate) {
      const revalidateOnFocusListener = () => {
        if (document.visibilityState === 'visible') {
          setTimeout(hydrate, baseConfig.revalidateTimeout)
        }
      }

      initRevalidateOnFocus(revalidateOnFocusListener)
    }

    hydrate()

    store.persist = {
      $$persist: SYMBOL_PERSIST,
      name: storageName,
      destroy: () => {
        storage.removeItem(storageName)
      },
      rehydrate: () => hydrate(),
      hydrated: () => hydrated
    }
  }
