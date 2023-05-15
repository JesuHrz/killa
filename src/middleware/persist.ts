import { Store } from '../core'
import { SYMBOL_PERSIST, SYMBOL_STORE } from '../utils/constants'
import {
  addDocumentEvent,
  removeDocumentEvent,
  serialize,
  deserialize,
  merge,
  messageError
} from '../utils/helpers'

interface CustomStorage<T> {
  getItem: (name: string) => T | null
  setItem: (name: string, value: unknown) => void
  removeItem: (name: string) => void
}

interface PersistConfig<T> {
  name: string
  storage?: CustomStorage<T>
  merge?: (state: T, persistedState: T) => T
  revalidate?: boolean
}

const normalizeStorage = <T>(
  storage: () => CustomStorage<T>
): CustomStorage<T> | null => {
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
    }
  } catch (e) {
    return null
  }
}

const initRevalidateOnFocus = (listener: () => void) => {
  addDocumentEvent('visibilitychange', listener)
  return () => {
    removeDocumentEvent('visibilitychange', listener)
  }
}

export const persist =
  <T extends Record<string, any>>(config: PersistConfig<T>) =>
  (store: Store<T>) => {
    const baseConfig = {
      storage: normalizeStorage(() => window.localStorage as CustomStorage<T>),
      merge,
      revalidate: true,
      revalidateTimeout: 300,
      ...config
    }
    const storageName = config.name
    const storage = baseConfig.storage

    if (store?.$$store !== SYMBOL_STORE) {
      messageError('Provide a valid killa store to persist your store.')
      return false
    }

    if (!storageName) {
      messageError('Provide a name to persist your store.')
      return false
    }

    if (!storage) {
      messageError('Provide a storage to persist your store.')
      return false
    }

    const _setState = store.setState
    let hydrated = false

    store.setState = (state, force) => {
      _setState(state, force)
      storage.setItem(storageName, store.getState())
    }

    const hydrate = () => {
      const persistedState = storage.getItem(storageName)

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
