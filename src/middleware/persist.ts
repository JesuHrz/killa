import { type Store } from 'killa/core'
import { SYMBOL_PERSIST, SYMBOL_STORE } from 'killa/constants'
import {
  addDocumentEvent,
  removeDocumentEvent,
  serialize,
  deserialize,
  merge,
  addWindowEvent,
  removeWindowEvent,
  encoded,
  decoded
} from 'killa/helpers'

export interface StoreWithPersist {
  $$persist: symbol
  name: string
  destroy: () => void
  rehydrate: () => void
  hydrated: () => boolean
}

declare module '../core' {
  interface Store {
    persist?: StoreWithPersist
  }
}

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
  /**
   *  Encrypt store using btoa and atob
   * @default false
   */
  encrypted?: boolean
}

export const normalizeStorage = <T>(
  initializerStorage: () => CustomStorage<T>,
  { encrypted = false } = {}
) => {
  try {
    const storage = initializerStorage()
    if (!storage) return null

    return {
      getItem: (name) => {
        const _name = encrypted ? encoded(name) : name
        const value = storage.getItem(_name) as string
        const data = encrypted && value ? decoded(value) : value

        return deserialize<T>(data)
      },
      setItem: (name, value) => {
        const _name = encrypted ? encoded(name) : name
        const data = encrypted ? encoded(serialize(value)) : serialize(value)

        return storage.setItem(_name, data)
      },
      removeItem: (name) => {
        const _name = encrypted ? encoded(name) : name
        storage.removeItem(_name)
      }
    } as CustomStorage<T>
  } catch (_e) {
    return null
  }
}

const validateStorage = <T>(
  initializerStorage: CustomStorage<T> | (() => CustomStorage<T>) | null
) => {
  if (typeof initializerStorage === 'function') {
    try {
      return initializerStorage()
    } catch (_e) {
      return null
    }
  }

  return initializerStorage
}

export const initRevalidateOnFocus = (listener: () => void) => {
  addWindowEvent('focus', listener)
  addDocumentEvent('visibilitychange', listener)
  return () => {
    removeWindowEvent('focus', listener)
    removeDocumentEvent('visibilitychange', listener)
  }
}

// TODO: Add default config to resolve
// __tests__/persist.test.ts:144
export const persist =
  <T>(config: PersistConfig<T>) =>
  (store: Store<T>) => {
    const baseConfig = {
      name: '',
      storage: normalizeStorage(() => window.localStorage as CustomStorage<T>, {
        encrypted: config?.encrypted || false
      }),
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
      return
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
          ...merge(store.getState(), persistedState)
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

    store.persist = Object.freeze({
      $$persist: SYMBOL_PERSIST,
      name: storageName,
      destroy: () => storage.removeItem(storageName),
      rehydrate: () => hydrate(),
      hydrated: () => hydrated
    })
  }
