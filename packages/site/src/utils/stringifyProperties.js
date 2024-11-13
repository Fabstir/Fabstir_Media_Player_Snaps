function isStringifiedArray(str) {
  if (typeof str === 'string') {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed);
    } catch (error) {
      return false;
    }
  } else {
    return false;
  }
}

export const stringifyArrayProperties = (obj) => {
  let myObject = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Stringify all arrays, regardless of their content
      myObject[key] = JSON.stringify(value);
    } else if (typeof value === 'object' && value !== null) {
      // Process object properties
      myObject[key] = stringifyArrayProperties(value); // Recursively stringify nested objects
    } else {
      // Copy value types as is
      myObject[key] = value;
    }
  });

  console.log('stringifyArrayProperties: myObject = ', myObject);

  return myObject;
};

export const parseArrayProperties = (obj) => {
  if (obj === undefined || typeof obj !== 'object' || obj === null) {
    return obj;
  }

  let myObject = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (key === '_') return; // Skip this key

    if (typeof value === 'string' && isStringifiedArray(value)) {
      // Parse all stringified array properties
      myObject[key] = JSON.parse(value);
    } else if (typeof value === 'object' && value !== null) {
      // Process object properties
      myObject[key] = parseArrayProperties(value); // Recursively parse nested objects
    } else {
      // Copy value types as is
      myObject[key] = value;
    }
  });

  console.log('parseArrayProperties: myObject = ', myObject);

  return myObject;
};

export const sortObjectProperties = (obj) => {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj = {};

  sortedKeys.forEach((key) => {
    sortedObj[key] = obj[key];
  });

  return sortedObj;
};
