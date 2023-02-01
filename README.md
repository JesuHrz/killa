<p align="center">
  <img src="killa-logo.png" />
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
