import { describe, expect, it, beforeEach, vi } from 'vitest'

import { createStore, Store } from '../src'
import { SYMBOL_PERSIST } from '../src/utils/constants'
import { encoded, decoded, deserialize } from '../src/utils/helpers'
import { persist } from '../src/middleware/persist'

const createMockedStorage = (persistedState: { counter: number }) => {
  type State = typeof persistedState
  let state: State | null = persistedState

  return {
    getItem: vi.fn(() => {
      if (!state) return null
      return state
    }),
    setItem: vi.fn(),
    removeItem: vi.fn(() => {
      state = null
    })
  }
}

describe('Persist', () => {
  let store: Store<{ counter: number }>
  const storeName = 'persist-store'
  const persistedState = { counter: 1 }
  const mockedStorage = createMockedStorage(persistedState)

  beforeEach(() => {
    store = createStore({ counter: 0 })
    mockedStorage.getItem.mockClear()
    mockedStorage.setItem.mockClear()
    mockedStorage.removeItem.mockClear()
  })

  it('Should export persist as named export', () => {
    expect(persist).toBeInstanceOf(Function)
  })

  it('Should init the middleware with the storage by default', () => {
    persist({ name: storeName })(store)

    expect(store?.persist?.name).toBe(storeName)
    expect(store?.persist?.hydrated()).toEqual(true)
    expect(store?.persist?.$$persist).toBe(SYMBOL_PERSIST)
    expect(store?.persist?.destroy).toBeInstanceOf(Function)
    expect(store?.persist?.rehydrate).toBeInstanceOf(Function)
  })

  it('Should decode and encode the store every time the store is updated', () => {
    persist({ name: storeName, encrypted: true })(store)

    const getStore = () =>
      deserialize(
        decoded(window.localStorage.getItem(encoded(storeName)) as string)
      )

    expect(store.getState()).toEqual(getStore())

    store.setState(() => ({ counter: 2 }))

    expect(store.getState()).toEqual(getStore())
  })

  it('Should init the middleware with a custom storage', () => {
    persist({ name: storeName, storage: mockedStorage })(store)

    store.setState(() => ({ counter: 2 }))

    expect(mockedStorage.getItem).toHaveBeenCalledTimes(1)
    expect(mockedStorage.setItem).toHaveBeenNthCalledWith(1, storeName, {
      counter: 1
    })
    expect(mockedStorage.setItem).toHaveBeenNthCalledWith(2, storeName, {
      counter: 2
    })
    expect(store.getState()).toEqual({ counter: 2 })
  })

  it('Should hydrate the store with the persisted store', () => {
    persist({ name: storeName, storage: mockedStorage })(store)

    expect(mockedStorage.getItem).toHaveBeenCalledTimes(1)
    expect(mockedStorage.getItem).toHaveBeenCalledExactlyOnceWith(storeName)
    expect(mockedStorage.getItem).toHaveReturnedWith(persistedState)
    expect(store.getState()).toEqual(persistedState)
  })

  it('Should rehydrate the store with the persisted store', () => {
    persist({ name: storeName, storage: mockedStorage })(store)

    store?.persist?.rehydrate()

    expect(mockedStorage.getItem).toHaveBeenCalledTimes(2)
    expect(store?.persist?.hydrated()).toEqual(true)
  })

  it('Should persist the store after updating the store', () => {
    persist({ name: storeName, storage: mockedStorage })(store)

    store.setState(() => ({ counter: 2 }))

    expect(mockedStorage.getItem).toHaveBeenCalledTimes(1)
    expect(mockedStorage.setItem).toHaveBeenNthCalledWith(1, storeName, {
      counter: 1
    })
    expect(mockedStorage.setItem).toHaveBeenNthCalledWith(2, storeName, {
      counter: 2
    })
    expect(store.getState()).toEqual({ counter: 2 })
  })

  it('Should persist state after updating the store using set method from initializer function', () => {
    type StoreState = { counter: number; increment: () => void }
    const store = createStore<StoreState>((_, set) => {
      return {
        counter: 0,
        increment: () => {
          set((state) => ({ counter: state.counter + 1 }))
        }
      }
    })

    persist({ name: storeName, storage: mockedStorage })(store)

    store.getState().increment()

    expect(mockedStorage.setItem).toHaveBeenNthCalledWith(1, storeName, {
      counter: 1,
      increment: expect.any(Function)
    })
  })

  it('Should get persisted state after updating the store using set method from initializer function', () => {
    const store = createStore<{
      counter: number
      increment: () => void
      getCounter: () => number
    }>((get, set) => {
      return {
        counter: 0,
        increment: () => {
          set((state) => ({ counter: state.counter + 1 }))
        },
        getCounter: () => {
          return get().counter
        }
      }
    })

    persist({ name: storeName, storage: mockedStorage })(store)

    store.getState().increment()

    expect(store.getState().getCounter()).toBe(2)

    expect(mockedStorage.getItem).toHaveBeenNthCalledWith(1, storeName)
  })

  it('Should remove the persisted store', () => {
    persist({ name: storeName, storage: mockedStorage })(store)

    store.setState(() => ({ counter: 1 }))

    store?.persist?.destroy()

    expect(mockedStorage.removeItem).toHaveBeenCalledTimes(1)
    expect(mockedStorage.removeItem).toHaveBeenCalledExactlyOnceWith(storeName)
    expect(mockedStorage.getItem()).toBe(null)
  })

  it('Should print an error when name store is empty', () => {
    const logSpy = vi.spyOn(console, 'error')

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    persist()(store)

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledExactlyOnceWith(
      '[Killa Persist] Provide a name to persist your store.'
    )
    logSpy.mockRestore()
  })

  it('Should print an error when name storage is empty', () => {
    const logSpy = vi.spyOn(console, 'error')

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    persist({ name: storeName, storage: null })(store)

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledExactlyOnceWith(
      '[Killa Persist] Provide a storage to persist your store.'
    )

    logSpy.mockRestore()
  })

  it('Should print an error when killa store is invalid', () => {
    const logSpy = vi.spyOn(console, 'error')

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    persist({ name: storeName, storage: mockedStorage })({})

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledExactlyOnceWith(
      '[Killa Persist] Provide a valid killa store to persist your store.'
    )

    logSpy.mockRestore()
  })

  it('Should print an error when the custom storage is invalid', () => {
    const logSpy = vi.spyOn(console, 'error')

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    persist({ name: storeName, storage: () => AsyncStore })(store)

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledExactlyOnceWith(
      '[Killa Persist] Provide a storage to persist your store.'
    )

    logSpy.mockRestore()
  })
})
