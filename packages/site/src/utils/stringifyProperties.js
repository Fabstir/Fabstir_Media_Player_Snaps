function isStringifiedArray(str) {
  if (typeof str === 'string') {
    try {
      return Array.isArray(JSON.parse(str))
    } catch (error) {
      return false
    }
  } else {
    return false
  }
}

export const stringifyArrayProperties = (obj) => {
  let myObject = {}

  Object?.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Stringify array properties
      myObject[key] = JSON.stringify(value)
    } else if (typeof value === 'object' && value !== null) {
      // Process object properties
      myObject[key] = {}
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (Array.isArray(nestedValue)) {
          myObject[key][nestedKey] = JSON.stringify(nestedValue)
        } else {
          myObject[key][nestedKey] = nestedValue
        }
      })
    } else {
      // Copy value types as is
      myObject[key] = value
    }
  })

  return myObject
}

export const parseArrayProperties = (obj) => {
  let myObject = {}

  Object?.entries(obj).forEach(([key, value]) => {
    if (key === '_') return // Skip this key

    if (typeof value === 'string' && isStringifiedArray(value)) {
      // Parse stringified array properties
      myObject[key] = JSON.parse(value)
    } else if (typeof value === 'object' && value !== null) {
      // Process object properties
      myObject[key] = {}
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (
          typeof nestedValue === 'string' &&
          isStringifiedArray(nestedValue)
        ) {
          myObject[key][nestedKey] = JSON.parse(nestedValue)
        } else {
          myObject[key][nestedKey] = nestedValue
        }
      })
    } else {
      // Copy value types as is
      myObject[key] = value
    }
  })

  return myObject
}
