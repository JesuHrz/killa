import clone from 'clone'

// Utils
import { deepEquals, isObject } from './utils/deep-equals'
import { SYMBOL_STORE, SYMBOL_SUBSCRIBER } from './utils/constants'

// Types
export interface Options<T> {
  compare?: (a: any, b: any) => boolean
  clone?: (state: T) => any
  use?: ((store: Store<T>) => void)[]
}

export type Selector<T> = (state: T) => any

export interface Subscriber<T> {
  (state: T, prevState: T): void
  $$subscriber?: symbol
  $$selectorState?: unknown
  $$selector?: Selector<T>
}

export type Store<T> = {
  [key: string]: any
  $$store: symbol
  getState: () => T
  setState: (fn: (state: T) => Partial<T>, force?: boolean) => void
  subscribe: (
    subscriber: Subscriber<T>,
    selector?: Selector<T>
  ) => () => boolean
  getServerState: () => T
}

export function createStore<T extends Record<string, any>>(
  initialState: T = Object.assign({}),
  options: Options<T> = {}
) {
  if (!isObject(initialState)) throw new Error('Store must be an object.')

  const subscribers = new Set<Subscriber<T>>()
  let state = clone(initialState) as T

  const compare =
    typeof options?.compare === 'function' ? options.compare : deepEquals

  const getState: Store<T>['getState'] = () => clone(state)

  const setState: Store<T>['setState'] = (fn, force = false) => {
    const newState = fn(getState()) || {}

    if (!compare(state, newState)) {
      const prevState = state

      state = force
        ? Object.assign({})
        : Object.assign(getState(), clone(newState))

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
    subscribe,
    getServerState: () => initialState
  }

  if (options.use && Array.isArray(options.use)) {
    options.use.forEach((middleware) => middleware(store))
  }

  if (process.env.NODE_ENV !== 'test') {
    return Object.freeze(store)
  }

  return store
}

export default createStore
