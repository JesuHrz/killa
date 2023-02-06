import clone from 'clone'

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
    const newState = fn(getState())

    if (!compare(state, newState)) {
      const prevState = state
      const _newState = !Object.keys(newState).length ? clone(initialState) : newState
      state = force ? {} : Object.assign(getState(), _newState)

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

  return Object.freeze({
    STORE: SYMBOL_STORE,
    getState,
    setState,
    subscribe
  })
}
