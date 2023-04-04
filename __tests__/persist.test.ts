import { createStore, Store } from '../src'
import { SYMBOL_PERSIST } from '../src/utils/constants'
import { persist } from '../src/middlewares/persist'

const createMockedStorage = (persistedState: Record<string, any> | null) => {
  let state = persistedState
  return {
    getItem: jest.fn(() => {
      if (!state) return null
      return JSON.stringify(state)
    }),
    setItem: jest.fn(),
    removeItem: jest.fn(() => {
      state = null
    })
  }
}

describe('Persist', () => {
  let store: Store<{ counter: number }>
  const storeName = 'persist-store'
  const persistedState = { counter: 1 }
  const storage = createMockedStorage(persistedState)

  beforeEach(() => {
    store = createStore({ counter: 0 })
    storage.getItem.mockClear()
    storage.setItem.mockClear()
    storage.removeItem.mockClear()
  })

  it('Should export persist as named export', () => {
    expect(persist).toBeInstanceOf(Function)
  })

  it('Should init the middleware once it is loaded', () => {
    persist({ name: storeName, storage })(store)

    expect(store.persist.name).toBe(storeName)
    expect(store.persist.hydrated()).toEqual(true)
    expect(store.persist.$$persist).toBe(SYMBOL_PERSIST)
    expect(store.persist.destroy).toBeInstanceOf(Function)
    expect(store.persist.rehydrate).toBeInstanceOf(Function)
  })

  it('Should init the middleware with a custom stogare', () => {
    const customStorage = (() => {
      let state = persistedState
      return {
        getItem: jest.fn(() => state),
        setItem: jest.fn(),
        removeItem: jest.fn(() => {
          state = null
        })
      }
    })()

    persist({ name: storeName, storage: () => customStorage })(store)

    store.setState(() => ({ counter: 2 }))

    expect(customStorage.getItem).toBeCalledTimes(1)
    expect(customStorage.setItem).toHaveBeenNthCalledWith(1, storeName, {
      counter: 1
    })
    expect(customStorage.setItem).toHaveBeenNthCalledWith(2, storeName, {
      counter: 2
    })
    expect(store.getState()).toEqual({ counter: 2 })
  })

  it('Should init the middleware with the storage by default', () => {
    persist({ name: storeName })(store)

    expect(store.persist.name).toBe(storeName)
    expect(store.persist.hydrated()).toEqual(true)
    expect(store.persist.$$persist).toBe(SYMBOL_PERSIST)
    expect(store.persist.destroy).toBeInstanceOf(Function)
    expect(store.persist.rehydrate).toBeInstanceOf(Function)
  })

  it('Should hydrate the store with the persisted store', () => {
    persist({ name: storeName, storage })(store)

    expect(storage.getItem).toBeCalledTimes(1)
    expect(storage.getItem).toHaveBeenCalledWith(storeName)
    expect(storage.getItem).toHaveReturnedWith(JSON.stringify(persistedState))
    expect(store.getState()).toEqual(persistedState)
  })

  it('Should rehydrate the store with the persisted store', () => {
    persist({ name: storeName, storage })(store)

    store.persist.rehydrate()

    expect(storage.getItem).toBeCalledTimes(2)
    expect(store.persist.hydrated()).toEqual(true)
  })

  it('Should persist the store after updating the store', () => {
    persist({ name: storeName, storage })(store)

    store.setState(() => ({ counter: 2 }))

    expect(storage.getItem).toBeCalledTimes(1)
    expect(storage.setItem).toHaveBeenNthCalledWith(
      1,
      storeName,
      JSON.stringify({ counter: 1 })
    )
    expect(storage.setItem).toHaveBeenNthCalledWith(
      2,
      storeName,
      JSON.stringify({ counter: 2 })
    )
    expect(store.getState()).toEqual({ counter: 2 })
  })

  it('Should remove the persisted store', () => {
    persist({ name: storeName, storage })(store)

    store.setState(() => ({ counter: 1 }))

    store.persist.destroy()

    expect(storage.removeItem).toBeCalledTimes(1)
    expect(storage.removeItem).toHaveBeenCalledWith(storeName)
    expect(storage.getItem()).toBe(null)
  })

  it('Should throw an error when name store is empty', () => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      persist({ storage })(store)
      throw new Error('Should fail because the name store is empty')
    } catch (e: any) {
      expect(e.message).toBe('Provide a name to persist your store.')
    }
  })

  it('Should throw an error when storage is empty', () => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      persist({ name: storeName, storage: () => null })(store)
      throw new Error('Should fail because the storage is empty')
    } catch (e: any) {
      expect(e.message).toBe('Provide a storage to persist your store.')
    }
  })

  it('Should throw an error when killa store is invalid', () => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      persist({ name: storeName, storage })({})
      throw new Error('Should fail because the valid killa store is invalid')
    } catch (e: any) {
      expect(e.message).toBe(
        'Provide a valid killa store to persist your store.'
      )
    }
  })

  it('Shpuld throw an error when the custom storage is invalid', () => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      persist({ name: storeName, storage: () => AsyncStore })(store)
      throw new Error('Should fail because the custom storage is invalid')
    } catch (e: any) {
      expect(e.message).toBe('Provide a storage to persist your store.')
    }
  })
})
