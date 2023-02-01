<p align="center">
  <img src="killa-logo.png" width="600" />
</p>

# KILLA

```bash
npm install killa
```

## How to create your first store

In order to create your first store you need to provide an object which will manage your state **(the internal state is inmutable).**

```js

// ESM
import killa from 'killa'
// or
import { createStore } from 'killa'

// CJS
const killa = require('killa')
// or
const { createStore } = require('killa')

const store = killa.createStore({ counter: 0 })
```

## How to access to your store

```js
import killa from 'killa'

const store = killa.createStore({ counter: 0 })

store.getStore() // { counter: 0 }
```

## How to update your store

```js
import killa from 'killa'

const store = killa.createStore({ counter: 0 })

store.setState((state) => {
  return {
    counter: 1
  }
})

store.getStore() // { counter: 1 }
```

## How to subscribe to events

```js
import killa from 'killa'

const store = killa.createStore({ counter: 0 })

store.subscribe((state, prevState) => {
  console.log('Updated state', state) // { counter: 1 }
  console.log('Previous state', prevState) // { counter: 0 }
})

store.setState((state) => {
  return {
    counter: 1
  }
})

store.getStore() // { counter: 1 }
```

You can also subscribe a single event

```js
import killa from 'killa'

const store = killa.createStore({ counter: 0, type: '' })

// This subscribe will be called after updating the counter state.
store.subscribe((state, prevState) => {
  console.log('Updated state', state) // { counter: 1 }
  console.log('Previous state', prevState) // { counter: 0 }
}, (state) => state.counter)

// This subscribe will not be called since the type state was not updated.
store.subscribe((state, prevState) => {
  console.log('Updated state', state)
  console.log('Previous state', prevState)
}, (state) => state.type)

store.setState((state) => {
  return {
    counter: 1
  }
})

store.getStore() // { counter: 1 }
```
