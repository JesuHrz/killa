import { createStore, Store } from '../src'
import { SYMBOL_PERSIST } from '../src/utils/constants'
import { encoded, decoded, deserialize } from '../src/utils/helpers'
import { persist } from '../src/middleware/persist'

const createMockedStorage = (persistedState: { counter: number }) => {
  type State = typeof persistedState
  let state: State | null = persistedState

  return {
    getItem: jest.fn(() => {
      if (!state) return null
      return state
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
  const mockedStorage = createMockedStorage(persistedState)

  beforeEach(() => {
    store = createStore({ counter: 0 }) as unknown as typeof store
    mockedStorage.getItem.mockClear()
    mockedStorage.setItem.mockClear()
    mockedStorage.removeItem.mockClear()
  })

  it('Should export persist as named export', () => {
    expect(persist).toBeInstanceOf(Function)
  })

  it('Should init the middleware with the storage by default', () => {
    persist<typeof persistedState>({ name: storeName })(store)

    expect(store?.persist?.name).toBe(storeName)
    expect(store?.persist?.hydrated()).toEqual(true)
    expect(store?.persist?.$$persist).toBe(SYMBOL_PERSIST)
    expect(store?.persist?.destroy).toBeInstanceOf(Function)
    expect(store?.persist?.rehydrate).toBeInstanceOf(Function)
  })

  it('Should decode and encode the store every time the store is updated', () => {
    persist<typeof persistedState>({ name: storeName, encrypted: true })(store)

    const getStore = () =>
      deserialize(
        decoded(window.localStorage.getItem(encoded(storeName)) as string)
      )

    expect(store.getState()).toEqual(getStore())

    store.setState(() => ({ counter: 2 }))

    expect(store.getState()).toEqual(getStore())
  })

  it('Should init the middleware with a custom stogare', () => {
    persist({ name: storeName, storage: mockedStorage })(store)

    store.setState(() => ({ counter: 2 }))

    expect(mockedStorage.getItem).toBeCalledTimes(1)
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

    expect(mockedStorage.getItem).toBeCalledTimes(1)
    expect(mockedStorage.getItem).toHaveBeenCalledWith(storeName)
    expect(mockedStorage.getItem).toHaveReturnedWith(persistedState)
    expect(store.getState()).toEqual(persistedState)
  })

  it('Should rehydrate the store with the persisted store', () => {
    persist({ name: storeName, storage: mockedStorage })(store)

    store?.persist?.rehydrate()

    expect(mockedStorage.getItem).toBeCalledTimes(2)
    expect(store?.persist?.hydrated()).toEqual(true)
  })

  it('Should persist the store after updating the store', () => {
    persist({ name: storeName, storage: mockedStorage })(store)

    store.setState(() => ({ counter: 2 }))

    expect(mockedStorage.getItem).toBeCalledTimes(1)
    expect(mockedStorage.setItem).toHaveBeenNthCalledWith(1, storeName, {
      counter: 1
    })
    expect(mockedStorage.setItem).toHaveBeenNthCalledWith(2, storeName, {
      counter: 2
    })
    expect(store.getState()).toEqual({ counter: 2 })
  })

  it('Should persist the store after updating the store', () => {
    persist({ name: storeName, storage: mockedStorage })(store)

    store.setState(() => ({ counter: 2 }))

    expect(mockedStorage.getItem).toBeCalledTimes(1)
    expect(mockedStorage.setItem).toHaveBeenNthCalledWith(1, storeName, {
      counter: 1
    })
    expect(mockedStorage.setItem).toHaveBeenNthCalledWith(2, storeName, {
      counter: 2
    })
    expect(store.getState()).toEqual({ counter: 2 })
  })

  it('Should remove the persisted store', () => {
    persist({ name: storeName, storage: mockedStorage })(store)

    store.setState(() => ({ counter: 1 }))

    store?.persist?.destroy()

    expect(mockedStorage.removeItem).toBeCalledTimes(1)
    expect(mockedStorage.removeItem).toHaveBeenCalledWith(storeName)
    expect(mockedStorage.getItem()).toBe(null)
  })

  it('Should print an error when name store is empty', () => {
    const logSpy = jest.spyOn(console, 'error')

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    persist()(store)

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith(
      '[Killa Persist] Provide a name to persist your store.'
    )
    logSpy.mockRestore()
  })

  it('Should print an error when name storage is empty', () => {
    const logSpy = jest.spyOn(console, 'error')

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    persist({ name: storeName, storage: null })(store)

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith(
      '[Killa Persist] Provide a storage to persist your store.'
    )

    logSpy.mockRestore()
  })

  it('Should print an error when killa store is invalid', () => {
    const logSpy = jest.spyOn(console, 'error')

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    persist({ name: storeName, storage: mockedStorage })({})

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith(
      '[Killa Persist] Provide a valid killa store to persist your store.'
    )

    logSpy.mockRestore()
  })

  it('Should print an error when the custom storage is invalid', () => {
    const logSpy = jest.spyOn(console, 'error')

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    persist({ name: storeName, storage: () => AsyncStore })(store)

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith(
      '[Killa Persist] Provide a storage to persist your store.'
    )

    logSpy.mockRestore()
  })
})
