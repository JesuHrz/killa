import clone from 'clone'

// Utils
import { SYMBOL_STORE, SYMBOL_LISTENER } from './utils/constants'
import { deepEquals } from './utils/deep-equals'

export const createStore = (initialState = {}, options = {}) => {
  const listeners = new Set()
  let state = clone(initialState)

  const compare = typeof options?.compare === 'function'
    ? options?.compare
    : deepEquals

  const getState = () => clone(state)

  const setState = (fn, force = false) => {
    let newState = fn(state)

    if (!compare(state, newState)) {
      const prevState = state

      newState = !Object.keys(newState).length ? initialState : newState
      state = force ? {} : Object.assign(getState(), newState)

      listeners.forEach((listener) => {
        const _prevState = clone(prevState)
        const _newState = getState()

        if (listener.LISTENER) {
          const selectorState = listener.SELECTOR_STATE
          const nextselectorState = listener.SELECTOR(state)

          if (!compare(selectorState, nextselectorState)) {
            listener.SELECTOR_STATE = nextselectorState
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
      listener.LISTENER = SYMBOL_LISTENER
      listener.SELECTOR_STATE = selector(state)
      listener.SELECTOR = selector
    }

    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const store = {
    STORE: SYMBOL_STORE,
    getState,
    setState,
    subscribe
  }

  return Object.freeze(store)
}
