import '@testing-library/jest-dom/extend-expect'

import { useEffect, useRef } from 'react'
import {
  render,
  screen,
  cleanup,
  fireEvent,
  renderHook,
  act
} from '@testing-library/react'

import { createStore, Store } from '../src'
import { useStore } from '../src/react'

describe('React', () => {
  let store: Store<{ counter: number; filter: string }>

  const Counter = ({ label = 'Counter +1' }) => {
    const [state, setState] = useStore(store, (state) => {
      return {
        counter: state.counter,
        filter: state.filter
      }
    })

    const handleCounter = () => {
      setState((state) => {
        return {
          counter: state.counter + 1
        }
      })
    }

    return (
      <div>
        <p>Counter: {state.counter}</p>
        <button onClick={handleCounter}>{label}</button>
      </div>
    )
  }

  beforeEach(() => {
    store = createStore({
      counter: 1,
      filter: ''
    })

    cleanup()
  })

  it('Should render Counter with initial state', () => {
    render(<Counter />)
    const $counter = screen.getByText(/counter: 1/i)
    expect($counter).toBeInTheDocument()
  })

  it('Should render Counter with the selector by default', () => {
    const Component = () => {
      useStore(store)

      return <p>Component</p>
    }

    render(<Component />)
  })

  it('Should throw a error when providing an invalid store to useStore as param', () => {
    try {
      renderHook(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        useStore({})
      })
      throw new Error('Should fail because the store is invalid')
    } catch (error: any) {
      expect(error.message).toBe('Provide a valid store for useStore.')
    }
  })

  it('Should update Counter state when clicking on the counter button', () => {
    render(<Counter />)

    const $button = screen.getByRole('button')

    fireEvent.click($button)

    const $counter = screen.getByText(/counter: 2/i)

    expect($counter).toBeInTheDocument()
  })

  it('Should rerender the Counter component when the store is updated', () => {
    render(<Counter />)

    expect(screen.getByText(/counter: 1/i)).toBeInTheDocument()

    act(() => {
      store.setState((state) => {
        return {
          ...state,
          counter: state.counter + 1
        }
      })
    })

    expect(screen.getByText(/counter: 2/i)).toBeInTheDocument()
  })

  it('Should rerender second Counter component after updating the store from the first Counter component', () => {
    const App = () => {
      return (
        <div>
          <Counter />
          <Counter label="Counter +2" />
        </div>
      )
    }
    render(<App />)

    const $buttons = screen.getAllByRole('button')

    expect(screen.getAllByText(/counter: 1/i)).toHaveLength(2)
    expect($buttons).toHaveLength(2)

    $buttons[0] && fireEvent.click($buttons[0])

    expect(screen.getAllByText(/counter: 2/i)).toHaveLength(2)
  })

  it('should rerender once after updating the store', () => {
    const { result } = renderHook(() => {
      const countRef = useRef(0)

      const [_, setState] = useStore(store, (state) => {
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
      }, [setState])

      countRef.current++

      return countRef.current
    })

    expect(result.current).toBe(2)
  })
})
