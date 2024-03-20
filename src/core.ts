import clone from 'just-clone'

import { deepEquals, isObject } from 'killa/deep-equals'
import { SYMBOL_STORE, SYMBOL_SUBSCRIBER } from 'killa/constants'

export interface Options<T> {
  compare?: (a: unknown, b: unknown) => boolean
  clone?: (state: T) => T
  use?: ((store: Store<T>) => void)[]
}

type State = Record<string, any>

export type Selector<T, U = unknown> = (state: T) => U

export interface Subscriber<T, U = unknown> {
  (state: T, prevState: T): void
  $$subscriber?: symbol
  $$selectorState?: U
  $$selector?: Selector<T, U>
}

export interface Store<T = State> {
  $$store: symbol
  getState: () => T
  setState: (fn: (state: T) => Partial<T>, force?: boolean) => void
  subscribe: {
    <U>(subscriber: Subscriber<T, U>, selector?: (State: T) => U): () => boolean
  }
  getServerState: () => T
}

type InitializerFn<T> = (
  getState: Store<T>['getState'],
  setState: Store<T>['setState']
) => T

export function createStore<T extends State, U = InitializerFn<T> | T>(
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

  const initialState: T =
    typeof initializer === 'function'
      ? initializer(getState, setState)
      : initializer

  const subscribe: Store<T>['subscribe'] = (subscriber, selector) => {
    if (typeof selector === 'function') {
      subscriber.$$subscriber = SYMBOL_SUBSCRIBER
      subscriber.$$selectorState = selector(state)
      subscriber.$$selector = selector
    }

    subscribers.add(subscriber)
    return () => subscribers.delete(subscriber)
  }

  if (!isObject(initialState)) throw new Error('Store must be an object.')

  state = clone<T>(initialState)

  const resetState = (state: unknown | null = null) => {
    const newState = state && isObject(state) ? state : clone(initialState)
    store.setState(() => newState, true)
  }

  const destroy = () => subscribers.clear()

  const store = {
    $$store: SYMBOL_STORE,
    getState,
    setState,
    subscribe,
    getServerState: () => initialState,
    resetState,
    destroy
  }

  if (options?.use && Array.isArray(options.use)) {
    options.use.forEach((middleware) => middleware(store))
  }

  if (process.env.NODE_ENV !== 'test') {
    return Object.freeze(store)
  }

  return store
}
