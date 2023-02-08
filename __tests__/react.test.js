import '@testing-library/jest-dom/extend-expect'

import { useEffect, useRef } from 'react'
import { render, screen, cleanup, fireEvent, renderHook } from '@testing-library/react'
import killa, { useStore } from '../src'

const Counter = ({ store, cb }) => {
  const { state, setState } = useStore(store, (state) => {
    return {
      counter: state.counter,
      filter: state.filter
    }
  })

  const handleCounter = () => {
    setState(cb)
  }

  return (
    <div>
      <p>Counter: {state.counter}</p>
      <button onClick={handleCounter}>
        Counter +1
      </button>
    </div>
  )
}

describe('React', () => {
  let store

  beforeEach(() => {
    cleanup()
    store = killa({ counter: 1 })
  })

  it('should render Counter with the counter state', () => {
    render(<Counter store={store} />)
    const $counter = screen.getByText(/counter: 1/i)
    expect($counter).toBeInTheDocument()
  })

  it('should update Counter state', () => {
    const cb = jest.fn((state) => {
      return {
        ...state,
        counter: state.counter + 1
      }
    })
    render(<Counter store={store} cb={cb} />)

    const $button = screen.getByRole('button')

    fireEvent.click($button)

    const $counter = screen.getByText(/counter: 2/i)

    expect(cb).toBeCalledTimes(1)
    expect($counter).toBeInTheDocument()
  })

  it('should rerender once after update the store', () => {
    const { result } = renderHook(() => {
      const countRef = useRef(0)

      const { setState } = useStore(store, (state) => {
        return {
          counter: state.counter,
          filter: state.filter
        }
      })

      useEffect(() => {
        setState((state) => {
          return {
            ...state,
            counter: state.counter + 1
          }
        })
      }, [])

      countRef.current++

      return countRef.current
    })

    expect(result.current).toBe(2)
  })
})
