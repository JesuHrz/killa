import { EventEmitter } from 'events'

const FOCUS_EVENT = 'focus'
const VISIBILITYCHANGE_EVENT = 'visibilitychange'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface EventEmitter {
      addEventListener: typeof EventEmitter.prototype.on
      removeEventListener: typeof EventEmitter.prototype.off
    }
  }
}

EventEmitter.prototype['addEventListener'] = EventEmitter.prototype.on
EventEmitter.prototype['removeEventListener'] = EventEmitter.prototype.off

const eventEmitter = new EventEmitter()

describe('Init Revalidate On Focus', () => {
  type TWindow = typeof global.window
  type TDocument = typeof global.document

  const globalSpy = {
    window: jest.spyOn(global, 'window', 'get'),
    document: jest.spyOn(global, 'document', 'get')
  }

  beforeEach(() => {
    globalSpy.window.mockImplementation(
      () => eventEmitter as unknown as TWindow
    )
    globalSpy.document.mockImplementation(
      () => eventEmitter as unknown as TDocument
    )

    jest.resetModules()
  })

  afterEach(() => {
    globalSpy.window.mockClear()
    globalSpy.document.mockClear()
  })

  it('Should trigger focus event', () => {
    const mockFn = jest.fn()

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initRevalidateOnFocus } = require('../src/middleware/persist')

    const revalidateOnFocus = initRevalidateOnFocus(mockFn)

    // Trigger focus event
    eventEmitter.emit(FOCUS_EVENT)

    // Remove focus event from window
    revalidateOnFocus()

    eventEmitter.emit(FOCUS_EVENT)

    expect(mockFn).toBeCalledTimes(1)
  })

  it('Should trigger visibilitychange event', () => {
    const mockFn = jest.fn()

    globalSpy.window.mockImplementation(
      () => eventEmitter as unknown as TWindow
    )
    globalSpy.document.mockImplementation(
      () => eventEmitter as unknown as TDocument
    )

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initRevalidateOnFocus } = require('../src/middleware/persist')

    const revalidateOnFocus = initRevalidateOnFocus(mockFn)

    // Trigger visibilitychange event
    eventEmitter.emit(VISIBILITYCHANGE_EVENT)

    // Remove visibilitychange event from document
    revalidateOnFocus()

    eventEmitter.emit(VISIBILITYCHANGE_EVENT)

    expect(mockFn).toBeCalledTimes(1)
  })
})
