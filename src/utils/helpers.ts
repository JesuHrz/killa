import { IS_WINDOW_DEFINED, IS_DOCUMENT_DEFINED } from './constants'

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {}

export const [addDocumentEvent, removeDocumentEvent] =
  IS_DOCUMENT_DEFINED && document.addEventListener
    ? [
        document.addEventListener.bind(window),
        document.removeEventListener.bind(window)
      ]
    : [noop, noop]

export const [addWindowEvent, removeWindowEvent] =
  IS_WINDOW_DEFINED && window.addEventListener
    ? [
        window.addEventListener.bind(window),
        window.removeEventListener.bind(window)
      ]
    : [noop, noop]

export const serialize = <T>(value: T): string => {
  return JSON.stringify(value)
}

export const deserialize = <T>(value: string): T | null => {
  if (value === null) return null

  return JSON.parse(value)
}

export const merge = <T>(state: T, persistedState: T): T => {
  return {
    ...state,
    ...persistedState
  }
}

export const messageError = console.error
