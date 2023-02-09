import '@testing-library/jest-dom/extend-expect'

import { useEffect, useRef } from 'react'
import { render, screen, cleanup, fireEvent, renderHook, act } from '@testing-library/react'
import killa, { useStore } from '../src'

const handleCounter = (state) => {
  return {
    ...state,
    counter: state.counter + 1
  }
}

const App = ({ store, handleCounter }) => {
  return (
    <div>
      <Counter store={store} onCounter={handleCounter} />
      <Counter store={store} label='Counter +2' onCounter={handleCounter} />
    </div>
  )
}

const Counter = ({ store, label = 'Counter +1', onCounter }) => {
  const { state, setState } = useStore(store, (state) => {
    return {
      counter: state.counter,
      filter: state.filter
    }
  })

  const handleCounter = () => {
    setState(onCounter)
  }

  return (
    <div>
      <p>Counter: {state.counter}</p>
      <button onClick={handleCounter}>
        {label}
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

  it('Should render Counter with the counter state with initial state', () => {
    render(<Counter store={store} onCounter={handleCounter} />)
    const $counter = screen.getByText(/counter: 1/i)
    expect($counter).toBeInTheDocument()
  })

  it('Should update Counter state when clicking on the counter button', () => {
    const cb = jest.fn(handleCounter)

    render(<Counter store={store} onCounter={cb} />)

    const $button = screen.getByRole('button')

    fireEvent.click($button)

    const $counter = screen.getByText(/counter: 2/i)

    expect(cb).toBeCalledTimes(1)
    expect($counter).toBeInTheDocument()
  })

  it('Should rerender the Counter component when the store is update outside React', () => {
    render(<Counter store={store} />)

    expect(screen.getByText(/counter: 1/i)).toBeInTheDocument()

    act(() => {
      store.setState(handleCounter)
    })

    expect(screen.getByText(/counter: 2/i)).toBeInTheDocument()
  })

  it('Should rerender second Counter component after updating the store from the first Counter component', () => {
    render(<App store={store} handleCounter={handleCounter} />)

    const $buttons = screen.getAllByRole('button')

    expect(screen.getAllByText(/counter: 1/i)).toHaveLength(2)
    expect($buttons).toHaveLength(2)

    fireEvent.click($buttons[0])

    expect(screen.getAllByText(/counter: 2/i)).toHaveLength(2)
  })

  it('should rerender once after updating the store', () => {
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
