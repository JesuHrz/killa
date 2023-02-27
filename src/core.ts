import clone from 'clone'

// Utils
import { deepEquals, isObject } from './utils/deep-equals'
import { SYMBOL_STORE, SYMBOL_SUBSCRIBER } from './utils/constants'

// Types
export interface Options {
  compare?: (a: any, b: any) => boolean
}

export type Selector<T> = (state: T) => any

export interface Subscriber<T> {
  (state: T, prevState: T): void
  $$subscriber?: symbol
  $$selectorState?: T
  $$selector?: Selector<T>
}

export type Store<T extends Record<string, any> = any> = {
  $$store: symbol
  getState: () => T
  setState: (fn: Selector<T>, force?: boolean) => void
  subscribe: (
    subscriber: Subscriber<T>,
    selector?: Selector<T>
  ) => () => boolean
}

export function createStore<T extends Record<string, any> = any>(
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

        if (subscriber.$$subscriber && subscriber.$$selector) {
          const selectorState = subscriber.$$selectorState
          const nextselectorState = subscriber.$$selector(state)

          if (!compare(selectorState, nextselectorState)) {
            subscriber.$$selectorState = nextselectorState
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
      subscriber.$$subscriber = SYMBOL_SUBSCRIBER
      subscriber.$$selectorState = selector(state)
      subscriber.$$selector = selector
    }

    subscribers.add(subscriber)
    return () => subscribers.delete(subscriber)
  }

  const store = {
    $$store: SYMBOL_STORE,
    getState,
    setState,
    subscribe
  }

  return Object.freeze(store)
}

export default createStore
