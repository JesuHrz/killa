import { IS_WINDOW_DEFINED, IS_DOCUMENT_DEFINED } from 'killa/constants'

export const noop = () => {}

export const [addDocumentEvent, removeDocumentEvent] =
  IS_DOCUMENT_DEFINED && document.addEventListener
    ? [
        document.addEventListener.bind(document),
        document.removeEventListener.bind(document)
      ]
    : [noop, noop]

export const [addWindowEvent, removeWindowEvent] =
  IS_WINDOW_DEFINED && window.addEventListener
    ? [
        window.addEventListener.bind(window),
        window.removeEventListener.bind(window)
      ]
    : [noop, noop]

export const serialize = <T>(value: T): string => JSON.stringify(value)

export const deserialize = <T>(value: string): T | null => {
  if (value === null) return null

  return JSON.parse(value)
}

export const merge = <T = unknown, U = unknown>(
  object: T,
  objectToMerge: U
): T & U => {
  return {
    ...object,
    ...objectToMerge
  }
}

export const messageError = console.error

export const encoded = (str: string) => btoa(encodeURIComponent(str))
export const decoded = (str: string) => decodeURIComponent(atob(str))
