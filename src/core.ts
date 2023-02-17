import clone from 'clone'

// Utils
import { deepEquals, isObject } from './utils/deep-equals'
import { SYMBOL_STORE, SYMBOL_SUBSCRIBER } from './utils/constants'

// Types
export interface Options {
  compare?: (a: any, b: any) => boolean
}

export type State<T> = Partial<T> | T

export type Selector<T> = (state: T) => any

export interface Subscriber<T> {
  (state: State<T>, prevState: State<T>): void
  SUBSCRIBER?: symbol
  SELECTOR_STATE?: Partial<T>
  SELECTOR?: Selector<T>
}

export type Store<T extends Record<string, any> = Record<string, any>> = {
  STORE: symbol
  getState: () => T
  setState: (fn: Selector<T>, force?: boolean) => void
  subscribe: (
    subscriber: Subscriber<T>,
    selector?: Selector<T>
  ) => () => boolean
}

export function createStore<T extends Record<string, any>>(
  initialState: T = Object.assign({}),
  options: Options = {}
) {
  if (!isObject(initialState)) throw new Error('Store must be an object.')

  const subscribers = new Set<Subscriber<T>>()
  let state = clone(initialState) as T

  const compare =
    typeof options?.compare === 'function' ? options?.compare : deepEquals

  const getState: Store<T>['getState'] = () => clone(state)

  const setState: Store<T>['setState'] = (fn, force = false) => {
    let newState = fn(state)

    if (!compare(state, newState)) {
      const prevState = state

      newState = !Object.keys(newState).length ? (initialState as T) : newState
      state = force ? Object.assign({}) : Object.assign(getState(), newState)

      subscribers.forEach((subscriber) => {
        const _prevState = clone(prevState)
        const _newState = getState()

        if (subscriber.SUBSCRIBER && subscriber.SELECTOR) {
          const selectorState = subscriber.SELECTOR_STATE
          const nextselectorState = subscriber.SELECTOR(state)

          if (!compare(selectorState, nextselectorState)) {
            subscriber.SELECTOR_STATE = nextselectorState
            subscriber(_newState, _prevState)
          }

          return
        }

        subscriber(_newState, _prevState)
      })
    }
  }

  const subscribe: Store<T>['subscribe'] = (subscriber, selector) => {
    if (typeof selector === 'function') {
      subscriber.SUBSCRIBER = SYMBOL_SUBSCRIBER
      subscriber.SELECTOR_STATE = selector(state)
      subscriber.SELECTOR = selector
    }

    subscribers.add(subscriber)
    return () => subscribers.delete(subscriber)
  }

  const store = {
    STORE: SYMBOL_STORE,
    getState,
    setState,
    subscribe
  }

  return Object.freeze(store)
}

export default createStore
