import clone from 'just-clone'

// Utils
import { deepEquals, isObject } from 'killa/deep-equals'
import { SYMBOL_STORE, SYMBOL_SUBSCRIBER } from 'killa/constants'

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

export interface Store<T = Record<string, any>> {
  $$store: symbol
  getState: () => T
  setState: (fn: (state: T) => T | Partial<T>, force?: boolean) => void
  subscribe: (
    subscriber: Subscriber<T>,
    selector?: Selector<T>
  ) => () => boolean
  getServerState: () => T
}

type InitializerFn<T> = (
  getState: Store<T>['getState'],
  setState: Store<T>['setState']
) => T

type State = Record<string, any>

export function createStore<T extends State, U = InitializerFn<T> | State>(
  initializer: U = Object.assign({}),
  options?: Options<T>
) {
  let state: T
  const subscribers = new Set<Subscriber<T>>()

  const compare =
    typeof options?.compare === 'function' ? options.compare : deepEquals

  const getState = () => clone(state)

  const setState: Store<T>['setState'] = (fn, force = false) => {
    const newState = fn(getState()) || {}

    if (!compare(state, newState)) {
      const prevState = state

      state = force
        ? Object.assign(newState)
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

  const initialState: T =
    typeof initializer === 'function'
      ? initializer(getState, setState)
      : initializer

  const resetState = (state: Partial<T> | null = null) => {
    const newState = state && isObject(state) ? state : clone(initialState)
    setState(() => newState, true)
  }

  if (!isObject(initialState)) throw new Error('Store must be an object.')

  state = clone<T>(initialState)

  const store = {
    $$store: SYMBOL_STORE,
    getState,
    setState,
    subscribe,
    getServerState: () => initialState,
    resetState
  }

  if (options?.use && Array.isArray(options.use)) {
    options.use.forEach((middleware) => middleware(store))
  }

  if (process.env.NODE_ENV !== 'test') {
    return Object.freeze(store)
  }

  return store
}
