import React from 'react'
import killa, { useStore } from 'killa'
import { persist } from 'killa/middlewares'
import reactLogo from './assets/react.svg'
import './App.css'

const store = killa(
  { counter: 0, filter: '' },
  {
    use: [
      persist({ name: 'killa-persist' })
    ]
  }
)

const Counter = () => {
  const [state, setState] = useStore(store, (state) => {
    return {
      counter: state.counter,
      filter: state.filter,
      subobject: state.subobject
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
    <div className='card'>
      <p>Counter: {state.counter}</p>
      <button onClick={handleCounter}>
        Counter +1
      </button>
    </div>
  )
}

function App () {
  return (
    <div className='App'>
      <div>
        <img src='/vite.svg' className='logo' alt='Vite logo' />
        <img src={reactLogo} className='logo react' alt='React logo' />
      </div>
      <h1>Vite + React + Killa</h1>
      <Counter />
    </div>
  )
}

export default App
