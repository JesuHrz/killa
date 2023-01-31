import clone from 'clone'

export const createStore = (initialState = {}, options = {}) => {
  const listeners = new Set()
  let state = clone(initialState)

  const getState = () => clone(state)

  const setState = (fn, force = false) => {
    const newState = fn(getState())

    let equals = false

    if (typeof options?.compare === 'function') {
      equals = options.compare(state, newState)
    }

    if (!equals) {
      const prevState = state
      const _newState = !Object.keys(newState).length ? clone(initialState) : newState
      state = force ? {} : Object.assign(getState(), _newState)

      listeners.forEach((listener) => {
        const _prevState = clone(prevState)
        const _newState = getState()

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
