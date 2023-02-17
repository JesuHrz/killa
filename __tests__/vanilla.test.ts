import killa, { createStore } from '../src'

describe('Vanilla', () => {
  it('Should export createStore as default export and named export', () => {
    expect(killa).toBe(createStore)
  })

  it('Should fail when the store is not object', () => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      killa(1)
      throw new Error('Should fail because the store is not object')
    } catch (e: any) {
      expect(e.message).toBe('Store must be an object.')
    }
  })

  it('Should create the store and provide the setState, getState and subscribe methods', () => {
    const store = killa({ count: 0 })
    expect(store.setState).toBeInstanceOf(Function)
    expect(store.getState).toBeInstanceOf(Function)
    expect(store.subscribe).toBeInstanceOf(Function)
  })

  it('Should set the inital state and state must be a new Object', () => {
    const initalState = { count: 0 }
    const store = killa<{ count: number }>({ count: 0 })
    const state = store.getState()

    expect(state).toEqual(initalState)
    expect(state).not.toBe(initalState)
  })

  it('Should set the inital state as empty object when inital state is not provided', () => {
    const store = killa<{ count: number }>()
    expect(store.getState()).toEqual({})
  })

  it('Should update the state', () => {
    const initalState = { count: 0 }
    const store = killa<{ count: number }>(initalState)
    const cb = jest.fn(() => ({ count: 1 }))

    store.setState(cb)

    expect(store.getState().count).toBe(1)
    expect(store.getState()).not.toBe(initalState)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('Should pass the current state as param in the setState method', () => {
    const initalState = { count: 0 }
    const store = killa<{ count: number }>(initalState)

    store.setState((state) => {
      expect(state).toEqual(initalState)
      expect(state).not.toBe(initalState)
      expect(state).not.toBe(store.getState())

      return {
        count: 1
      }
    })
  })

  it('Should call the global subscriber when updating the state', () => {
    const initalState = { count: 0 }
    const store = killa<{ count: number }>(initalState)
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
    const store = killa(initalState)

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
    const store = killa(initalState)
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
    const store = killa(initalState)
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
    const store = killa(initalState)
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

  it('Should reset state to initial state', () => {
    const initalState = { count: 0, text: '' }
    const store = killa(initalState)

    store.setState(() => {
      return {}
    })

    expect(store.getState()).toEqual(initalState)
    expect(store.getState()).not.toBe(initalState)
  })

  it('Should destroy state to empty state', () => {
    const initalState = { count: 0, text: '' }
    const store = killa(initalState)

    store.setState(() => {
      return {}
    }, true)

    expect(store.getState()).toEqual({})
  })

  it('Should not update the state if the compare function return true', () => {
    const compare = jest.fn(() => true)
    const firstSubscribe = jest.fn()

    const store = killa({ count: 0, text: '' }, { compare })

    store.subscribe(firstSubscribe)
    store.setState((state) => state)

    expect(compare).toHaveBeenCalledTimes(1)
    expect(firstSubscribe).toHaveBeenCalledTimes(0)
  })

  it('Should update the state if the compare function return false', () => {
    const compare = jest.fn(() => false)
    const store = killa({ count: 0, text: '' }, { compare })

    const firstSubscribe = jest.fn()

    store.subscribe(firstSubscribe)
    store.setState((state) => state)

    expect(compare).toHaveBeenCalledTimes(1)
    expect(firstSubscribe).toHaveBeenCalledTimes(1)
  })
})
