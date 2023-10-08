<p align="center">
  <img src="killa-logo.png" width="600" />
</p>

# KILLA
Killa is a small and lightweight state management library for vanilla and React inspired by Zustand and SWR.

```bash
npm install killa
```

### Installing the vanilla version for Browser
To use directly vanilla minified version in the browser:

```html
<script src="https://unpkg.com/killa@1.7.2/dist/umd/killa.min.js"></script>
```


```html
<script src="https://cdn.jsdelivr.net/npm/killa@1.7.2/dist/umd/killa.min.js"></script>
```

### How to create your first store

To create your first store you need to provide an object which will manage your state. **(The internal state is inmutable)**

```js
import { createStore } from 'killa'
// or
const { createStore } = require('killa')

const store = createStore({ counter: 0 })
```

## Vanilla
### How to access to your store

```js
store.getState() // { counter: 0 }
```

### How to update your store
```js
store.setState(() => {
  return {
    counter: 1
  }
})

store.getState() // { counter: 1 }
```

### How to subscribe to state events

```js
// This subscriber will be called every time that our state is updated.
// We could say that this would be a global subscriber.
store.subscribe((state, prevState) => {
  console.log(state) // { counter: 1 }
  console.log(prevState) // { counter: 0 }
})

store.setState(() => {
  return {
    counter: 1
  }
})

store.getState() // { counter: 1 }
```

But you can also subscribe to a specific event:

```js
const store = createStore({ counter: 0, type: '', filter: '' })

// This subscriber will be called only when the counter state is updated.
store.subscribe((state, prevState) => {
  console.log(state) // { counter: 1, type: '', filter: '' }
  console.log(prevState) // { counter: 0, type: '', filter: '' }
}, (state) => state.counter)

// This subscriber will be called when the state of counter or filter is updated.
store.subscribe((state) => {
  console.log(state) // { counter: 1, type: '', filter: '' }
}, (state) => ({ counter: state.counter, filter: state.filter }))

// This subscriber will not be called since the type state was not updated.
store.subscribe((state, prevState) => {
  console.log(state, prevState)
}, (state) => state.type)

store.setState((state) => {
  return {
    ...state,
    counter: state.counter + 1
  }
})

store.getState() // { counter: 1, type: '', filter: '' }
```

### Resting and overwriting state
To reset or overwrite your store you need to use the method `resetState`

```js
store.resetState() // Reseting to initial state
store.getState() // { counter: 0, type: '', filter: '' }

store.resetState({ notes: [] }) // Overwriting all state to the new state
store.getState() // { notes: [] }
```

### Destroying all subscribers
To destroy all events to which your store has subscribed, you need to use the method `destroy` and this way events won't longer be triggered

```js
store.destroy()
```

### Using internal Actions
You can also initialize your store using `get` and `set` actions to update state using custom method within your store

```js
const store = createStore((get, set) => {
  return {
    count: 1,
    inc: () => set(() => ({ count: get().count + 1 })),
    getCount: () => get().count
  }
})

store.getState().inc() // Increments count state to 2
store.getState().getCount() // 2
```

## React

```jsx
import { createStore } from 'killa'
import { useStore } from 'killa/react'

const store = createStore({ counter: 0, type: '', filter: '' })

const Counter = () => {
  // This component will only be rendered when counter or filter state changes
  const [state, setState] = useStore(store, (state) => {
    return {
      counter: state.counter,
      filter: state.filter
    }
  })

  const handleCounter = (e) => {
    setState((state) => {
      return {
        ...state,
        counter: state.counter + 1
      }
    })
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
```

### Silect states
The silent states allow to memorize the selected state, this means that if any key of our store is updated it will not have any effect inside our component and will not generate a re-render. However you will be able to update the state using `setState` but this will have no any effect within the component.

```jsx
// In this way, you get the whole store
const [state, setState] = useStore(store, null)
```


```jsx
// In this way, you can get a specifict state from store
const [state, setState] = useStore(store, (state) => state.counter, true)
```

## Middlewares
To use directly vanilla minified version in the browser:

```html
<script src="https://unpkg.com/killa@1.7.2/dist/umd/killaMiddlewares.min.js"></script>
```

Or from jsdelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/killa@1.7.2/dist/umd/killaMiddlewares.min.js"></script>
```

For vanilla, you can access to the middlewares using: `window.killaMiddlewares`
### Persist

Killa Persist uses `localStorage` by default.

```js
import { persist } from 'killa/persist'

const store = createStore(
  { counter: 0, filter: '' },
  {
    use: [
      persist({
        name: 'killa-persist',
        revalidate: false // true by default
        revalidateTimeout: 300 // 200 by default
        encrypted: true // false by default
      })
    ]
  }
)
```

If you wish to use other storage you can do so by using the `normalizeStorage` method to normalize the storage supported by Killa Persist.

```js
import { persist, normalizeStorage } from 'killa/persist'

const store = createStore(
  { counter: 0, filter: '' },
  {
    use: [
      persist({
        name: 'killa-persist',
        storage: normalizeStorage(() => sessionStorage)
      })
    ]
  }
)
```

#### Auto Revalidate

<img src="killa-revalidate.gif" width="600" />

## Support
React >= 16.8, Chrome 58, Firefox 57, IE 11, Edge 18, Safari  11, & Node.js 12.
