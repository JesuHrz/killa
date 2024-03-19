import { createStore } from '../src'

describe('Vanilla', () => {
  it('Should export createStore as default export and named export', () => {
    expect(createStore).toBe(createStore)
  })

  it('Should fail when the store is not object', () => {
    try {
      createStore(1)
      throw new Error('Should fail because the store is not object')
    } catch (e: any) {
      expect(e.message).toBe('Store must be an object.')
    }
  })

  it('Should create the store and provide the setState, getState and subscribe methods', () => {
    const store = createStore({ count: 0 })
    expect(store.setState).toBeInstanceOf(Function)
    expect(store.getState).toBeInstanceOf(Function)
    expect(store.subscribe).toBeInstanceOf(Function)
  })

  it('Should set the inital state and state must be a new Object', () => {
    const initalState = { count: 0 }
    const store = createStore<{ count: number }>({ count: 0 })
    const state = store.getState()

    expect(state).toEqual(initalState)
    expect(state).not.toBe(initalState)
  })

  it('Should set the inital state as empty object when inital state is not provided', () => {
    const store = createStore<{ count: number }>()
    expect(store.getState()).toEqual({})
  })

  it('Should update the state', () => {
    const initalState = { count: 0 }
    const store = createStore<{ count: number }>(initalState)
    const cb = jest.fn(() => ({ count: 1 }))

    store.setState(cb)

    expect(store.getState().count).toBe(1)
    expect(store.getState()).not.toBe(initalState)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('Should pass the current state as param in the setState method', () => {
    const initalState = { count: 0 }
    const store = createStore<{ count: number }>(initalState)

    store.setState((state) => {
      expect(state).toEqual(initalState)
      expect(state).not.toBe(initalState)
      expect(state).not.toBe(store.getState())

      return {
        count: 1
      }
    })
  })

  it('Should be able to use the get and set method to update the state ', () => {
    const store = createStore<{
      count: number
      inc: () => void
      getCount: () => number
    }>((get, set) => {
      return {
        count: 1,
        inc: () => set(() => ({ count: get().count + 1 })),
        getCount: () => get().count
      }
    })

    store.getState().inc()

    expect(store.getState().count).toEqual(2)
    expect(store.getState().getCount()).toEqual(2)
  })

  it('Should just mutate the internal state using the setState method', () => {
    const initalState = { count: 0 }
    const store = createStore<{ count: number }>(initalState)
    const state = store.getState()
    const expectedState = { count: 1 }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    state.foo = 'foo'

    expect(state).not.toBe(initalState)
    expect(state).not.toEqual(expectedState)

    store.setState((state) => {
      expect(state).toEqual(initalState)
      expect(state).not.toBe(initalState)
      expect(state).not.toBe(store.getState())

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      state.bar = 'bar'

      return {
        count: 1
      }
    })

    expect(store.getState()).toEqual(expectedState)
  })

  it('Should call the global subscriber when updating the state', () => {
    const initalState = { count: 0 }
    const store = createStore<{ count: number }>(initalState)
    const cb = jest.fn()

    store.subscribe(cb)

    store.setState(() => {
      return {
        count: 1
      }
    })

    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('Should pass the current and previous state to subscribers when state is updated', () => {
    const initalState = { count: 0 }
    const store = createStore(initalState)

    const firstSubscribe = jest.fn((state, prevState) => {
      expect(state).toEqual(store.getState())
      expect(state).not.toBe(store.getState())

      expect(prevState).toEqual(initalState)
      expect(prevState).not.toBe(initalState)

      state.count = 2
      state.prevState = 2
    })

    const secondSubscribe = jest.fn((state, prevState) => {
      expect(state).toEqual(store.getState())
      expect(state).not.toBe(store.getState())
      expect(state.count).toBe(1)

      expect(prevState).toEqual(initalState)
      expect(prevState).not.toBe(initalState)
      expect(prevState.count).toBe(0)
    })

    store.subscribe(firstSubscribe)
    store.subscribe(secondSubscribe)

    store.setState(() => {
      return {
        count: 1
      }
    })

    expect(firstSubscribe).toHaveBeenCalledTimes(1)
    expect(secondSubscribe).toHaveBeenCalledTimes(1)
  })

  it('Should just call the subscribers when the state of the selector is updated', () => {
    const initalState = { count: 0, text: '' }
    const store = createStore(initalState)
    const firstSubscribe = jest.fn()
    const secondSubscribe = jest.fn()

    store.subscribe(firstSubscribe, (state) => state.count)
    store.subscribe(secondSubscribe, (state) => state.text)

    store.setState(() => {
      return {
        count: 1
      }
    })

    expect(firstSubscribe).toHaveBeenCalledTimes(1)
    expect(secondSubscribe).toHaveBeenCalledTimes(0)
  })

  it('Should just call a subscribers once when the subscriber function is the same', () => {
    const initalState = { count: 0, text: '' }
    const store = createStore(initalState)
    const firstSubscribe = jest.fn()

    store.subscribe(firstSubscribe)
    store.subscribe(firstSubscribe)

    store.setState(() => {
      return {
        count: 1
      }
    })

    expect(firstSubscribe).toHaveBeenCalledTimes(1)
  })

  it('Should unsubscribe to a subscriber', () => {
    const initalState = { count: 0, text: '' }
    const store = createStore(initalState)

    const firstSubscribe = jest.fn()
    const unsubscribe = store.subscribe(firstSubscribe, (state) => state.count)

    store.setState(() => {
      return {
        count: 1
      }
    })

    unsubscribe()

    store.setState(() => {
      return {
        count: 2
      }
    })

    expect(firstSubscribe).toHaveBeenCalledTimes(1)
  })

  it('Should reset the store to the inital state', () => {
    const initalState = { count: 0 }
    const store = createStore<{ count: number }>({ count: 0 })

    expect(store.getState()).toEqual(initalState)
    store.setState(() => ({ count: 1 }))
    expect(store.getState()).toEqual({ count: 1 })
    store.resetState()
    expect(store.getState()).toEqual(initalState)
  })

  it('Should force to update all state', () => {
    const initalState = { count: 0 }
    const forceState = { force: true }
    const store = createStore({ count: 0 })

    expect(store.getState()).toEqual(initalState)
    store.setState(() => ({ count: 1 }))
    expect(store.getState()).toEqual({ count: 1 })
    store.resetState(forceState)
    expect(store.getState()).toEqual(forceState)
  })

  it('Should force to reset all state', () => {
    const initalState = { count: 0, text: '' }
    const store = createStore(initalState)

    store.setState(() => {
      return { force: true }
    }, true)

    expect(store.getState()).toEqual({ force: true })
  })

  it('Should not update the state if the compare function return true', () => {
    const compare = jest.fn(() => true)
    const firstSubscribe = jest.fn()

    const store = createStore({ count: 0, text: '' }, { compare })

    store.subscribe(firstSubscribe)
    store.setState((state) => state)

    expect(compare).toHaveBeenCalledTimes(1)
    expect(firstSubscribe).toHaveBeenCalledTimes(0)
  })

  it('Should update the state if the compare function return false', () => {
    const compare = jest.fn(() => false)
    const store = createStore({ count: 0, text: '' }, { compare })

    const firstSubscribe = jest.fn()

    store.subscribe(firstSubscribe)
    store.setState((state) => state)

    expect(compare).toHaveBeenCalledTimes(1)
    expect(firstSubscribe).toHaveBeenCalledTimes(1)
  })

  it('Should apply middlewares', () => {
    const middleware = jest.fn()
    const store = createStore({ count: 0, text: '' }, { use: [middleware] })

    expect(middleware).toHaveBeenCalledTimes(1)
    expect(middleware).toHaveBeenCalledWith(store)
  })

  it('Should fail if use option is not an array', () => {
    const middleware = jest.fn()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    createStore({ count: 0, text: '' }, { use: '' })

    expect(middleware).not.toBeCalled()
  })
})
