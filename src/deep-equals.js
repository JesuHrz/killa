const isObject = (object) => {
  return object !== null && typeof object === 'object'
}

export const deepEquals = (typeA, typeB) => {
  if (!isObject(typeA) && !isObject(typeB) && Object.is(typeA, typeB)) {
    return true
  }

  if (typeA instanceof Date && typeB instanceof Date) {
    return Object.is(typeA.getTime(), typeB.getTime())
  }

  if (
    !isObject(typeA) || typeA === null ||
    !isObject(typeB) || typeB === null
  ) {
    return false
  }

  if (typeA instanceof Map && typeB instanceof Map) {
    if (typeA.size !== typeB.size) {
      return false
    }

    for (const item of typeA) {
      const key = item[0]
      const value = item[1]

      if (!Object.is(value, typeB.get(key))) {
        return deepEquals(value, typeB.get(key))
      }
    }

    return true
  }

  if (typeA instanceof Set && typeB instanceof Set) {
    if (typeA.size !== typeB.size) {
      return false
    }

    return deepEquals([...typeA.values()], [...typeB.values()])
  }

  const keysA = Object.keys(typeA)
  const keysB = Object.keys(typeB)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (const key of keysA) {
    const valueA = typeA[key]
    const valueB = typeB[key]
    const areObjects = isObject(valueA) && isObject(valueB)

    if (
      (areObjects && !deepEquals(valueA, valueB)) ||
      (!areObjects && !Object.is(valueA, valueB))
    ) {
      return false
    }
  }

  return true
}
