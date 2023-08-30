import React, { useCallback } from 'react'
import { createStore } from 'killa'
import { useStore } from 'killa/react'
import { persist } from 'killa/persist'
import reactLogo from './assets/react.svg'
import './App.css'

const store = createStore(
  { counter: 0, filter: '' },
  {
    use: [
      persist({
        name: 'killa-persist',
        encrypted: true
      })
    ]
  }
)

const Counter = () => {
  const [state, setState] = useStore(store, (state) => {
    return {
      counter: state.counter,
      filter: state.filter
    }
  })

  const handleCounter = () => {
    setState(() => {
      return {
        ...state,
        counter: state.counter + 1
      }
    })
  }

  return (
    <div className="card">
      <button onClick={handleCounter}>Counter +1</button>
    </div>
  )
}

const Label = ({ silect, selector = null }) => {
  const [state, setState] = useStore(store, selector, silect)

  const update = () => {
    setState((state) => ({ counter: state.counter + 1 }))
  }

  return <p onClick={update}>Counter: {state.counter}</p>
}

function App() {
  const selector = useCallback((state) => {
    return {
      counter: state.counter,
      filter: state.filter
    }
  }, [])

  return (
    <div className="App">
      <div>
        <img src="/vite.svg" className="logo" alt="Vite logo" />
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
      <h1>Vite + React + Killa</h1>
      <Label />
      <Label selector={selector} />
      <Counter />
    </div>
  )
}

export default App
