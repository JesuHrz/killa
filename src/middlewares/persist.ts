import { Store } from '../core'
import { SYMBOL_PERSIST, SYMBOL_STORE } from '../utils/constants'

interface CustomStorage<T> {
  getItem: (name: string) => T | string | null
  setItem: (name: string, value: unknown) => void | Promise<void>
  removeItem: (name: string) => void | Promise<void>
}

interface PersistConfig<T> {
  name: string
  storage?: CustomStorage<T> | (() => CustomStorage<T>)
  merge?: (state: T, persistedState: T) => T
}

const serialize = <T>(value: T): string => {
  return JSON.stringify(value)
}

const deserialize = <T>(value: string): T | null => {
  if (value === null) return null

  return JSON.parse(value)
}

const merge = <T>(state: T, persistedState: T): T => {
  return {
    ...state,
    ...persistedState
  }
}

const createStorage = <T>(
  storage: PersistConfig<T>['storage']
): CustomStorage<T> | null => {
  if (!storage) return null

  if (typeof storage === 'function') {
    try {
      return storage()
    } catch (e) {
      return null
    }
  }

  return {
    getItem: (name) => {
      const value = storage.getItem(name) as string
      return deserialize<T>(value)
    },
    setItem: (name, value) => storage.setItem(name, serialize(value)),
    removeItem: (name) => storage.removeItem(name)
  }
}

export const persist =
  <T extends Record<string, any>>(config: PersistConfig<T>) =>
  (store: Store<T>) => {
    const baseConfig = {
      storage: window.localStorage as unknown as PersistConfig<T>['storage'],
      merge,
      ...config
    }
    const storageName = config.name

    if (store?.$$store !== SYMBOL_STORE) {
      throw new Error('Provide a valid killa store to persist your store.')
    }

    if (!storageName) {
      throw new Error('Provide a name to persist your store.')
    }

    const storage = createStorage(baseConfig.storage)

    if (!storage) {
      throw new Error('Provide a storage to persist your store.')
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

    store.persist = {
      $$persist: SYMBOL_PERSIST,
      name: storageName,
      destroy: () => {
        storage.removeItem(storageName)
      },
      rehydrate: () => hydrate(),
      hydrated: () => hydrated
    }

    hydrate()
  }
