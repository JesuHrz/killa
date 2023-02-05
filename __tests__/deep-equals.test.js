
import { deepEquals } from '../src/deep-equals'

describe('DeepEquals', () => {
  it('Should export deepEquals as named export', () => {
    expect(deepEquals).toBeInstanceOf(Function)
  })

  it('Should compare strings', () => {
    expect(deepEquals('string', 'string')).toBe(true)
    expect(deepEquals('string', 'other-string')).toBe(false)
  })

  it('Should compare numbers', () => {
    expect(deepEquals(1, 1)).toBe(true)
    expect(deepEquals(1, 2)).toBe(false)
  })

  it('Should compare booleans', () => {
    expect(deepEquals(true, true)).toBe(true)
    expect(deepEquals(true, false)).toBe(false)
  })

  it('Should compare nulls', () => {
    expect(deepEquals(null, null)).toBe(true)
    expect(deepEquals(null, false)).toBe(false)
  })

  it('Should compare arrays', () => {
    expect(deepEquals([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(deepEquals([1, 2, 3], [3, 2, 1])).toBe(false)
  })

  it('Should compare arrays of objects', () => {
    expect(deepEquals(
      [{ a: 1, b: 2, c: 'c' }, { a: 1, b: 2, c: 'c' }],
      [{ a: 1, b: 2, c: 'c' }, { a: 1, b: 2, c: 'c' }]
    )).toBe(true)
    expect(deepEquals(
      [{ a: 1, b: 2, c: 'c' }, { a: 1, b: 2, c: 'c' }],
      [{ a: 2, b: 1, c: 'c' }, { a: 1, b: 2, c: 'c' }]
    )).toBe(false)
  })

  it('Should compare simple objects', () => {
    expect(deepEquals({ a: 1, b: 2, c: 'c' }, { a: 1, b: 2, c: 'c' })).toBe(true)
    expect(deepEquals({ a: 1, b: 2, c: 'c' }, { a: 2, b: 1 })).toBe(false)
  })

  it('Should compare nested objects', () => {
    expect(deepEquals(
      { a: 1, b: 2, c: { y: 2, z: '1' } },
      { a: 1, b: 2, c: { y: 2, z: '1' } }
    )).toBe(true)
    expect(deepEquals(
      { a: 1, b: 2, c: { y: 2, z: '1' } },
      { a: 1, b: 2, c: { y: 2, z: '2' } }
    )).toBe(false)
  })

  it('Should compare functions', () => {
    const foo = () => 'foo'
    const bar = () => 'bar'

    expect(deepEquals(foo, foo)).toBe(true)
    expect(deepEquals(foo, bar)).toBe(false)
  })

  it('Should compare Maps', () => {
    const firstMap = new Map([['Map', { name: 'I am a map', phone: '213-555-1234' }]])
    const secondMap = new Map([['Map', { name: 'I am a map', phone: '213-555-1234' }]])
    const thirdMap = new Map([
      ['Map', { name: 'I am third map', phone: '213-555-1234' }],
      [1, 1]
    ])

    expect(deepEquals(firstMap, firstMap)).toBe(true)
    expect(deepEquals(firstMap, secondMap)).toBe(true)
    expect(deepEquals(firstMap, thirdMap)).toBe(false)
  })

  it('Should compare Sets', () => {
    const firstSet = new Set(['1', { name: 'I am a set', phone: '213-555-1234' }])
    const secondSet = new Set(['1', { name: 'I am a set', phone: '213-555-1234' }])
    const thirdSet = new Set(
      ['2', { name: 'I am another', phone: '213-555-1234' }, 2]
    )

    expect(deepEquals(firstSet, secondSet)).toBe(true)
    expect(deepEquals(firstSet, thirdSet)).toBe(false)
  })

  it('Should compare Dates', () => {
    expect(deepEquals(
      new Date('2023-01-04T00:00:00.000Z'),
      new Date('2023-01-04T00:00:00.000Z')
    )).toBe(true)

    expect(deepEquals(
      new Date('2023-01-04T00:00:00.000Z'),
      new Date('2023-01-05T00:00:00.000Z')
    )).toBe(false)
  })
})
