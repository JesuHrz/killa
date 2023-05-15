"use client"

import { useCallback } from 'react'
import Image from 'next/image'
import killa, { useStore } from 'killa'
import { persist } from 'killa/middleware'

const store = killa(
  { counter: 0, filter: '' },
  {
    use: [
      persist({ name: 'next/killa-persist' })
    ]
  }
)

export default function Home() {
  const [state, setState] = useStore(store, (state) => {
    return {
      counter: state.counter,
      filter: state.filter,
      subobject: state.subobject
    }
  })

  const handleCounter = useCallback(() => {
    setState(() => {
      return {
        ...state,
        counter: state.counter + 1
      }
    })
  }, [state])

  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
        <h1 className='text-[48px] pl-5'>+ Killa</h1>
      </div>
      <div className='flex flex-col items-center z-10'>
        <p className='text-[20px]'>Counter: {state.counter}</p>
        <button className='text-[18px] text-black bg-[#ffffff70] p-2 rounded-xl mt-2' onClick={handleCounter}>
          Counter +1
        </button>
      </div>
    </main>
  )
}
