import clone from 'clone'

export const createStore = (initialState = {}, options = {}) => {
  const listeners = new Set()
  let state = clone(initialState)

  const getState = () => clone(state)

  const setState = (fn, force = false) => {
    const prevState = state
    const newState = fn(state)

    let equals = false

    if (force) {
      state = {}
    }

    if (typeof options?.compare === 'function') {
      equals = options.compare(prevState, newState)
    }

    if (!equals) {
      const _newState = !Object.keys(newState).length ? clone(initialState) : newState
      state = force ? {} : clone(Object.assign(state, _newState))

      listeners.forEach((listener) => {
        const _prevState = clone(prevState)
        const _newState = clone(state)

        if (listener.LISTENER) {
          const currentState = listener.STATE
          const nextState = listener.SELECTOR(state)

          if (!Object.is(currentState, nextState)) {
            listener.STATE = nextState
            listener(_newState, _prevState)
          }

          return
        }

        listener(_newState, _prevState)
      })
    }
  }

  const subscribe = (listener, selector) => {
    if (selector) {
      listener.LISTENER = Symbol('@@killa-listener')
      listener.STATE = selector(state)
      listener.SELECTOR = selector
    }

    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return { getState, setState, subscribe }
}
