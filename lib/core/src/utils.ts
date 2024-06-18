export function deepCompare(obj1: any, obj2: any) {
  // compare types
  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  // compare properties recursively
  if (typeof obj1 === 'object') {
    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
      return false;
    }
    if (Array.isArray(obj1)) {
      if (obj1.length !== obj2.length) {
        return false;
      }
      for (let i = 0; i < obj1.length; i++) {
        if (!deepCompare(obj1[i], obj2[i])) {
          return false;
        }
      }
    } else {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) {
        return false;
      }
      for (const key of keys1) {
        if (
          !Object.prototype.hasOwnProperty.call(obj2, key)
          //  || !deepCompare(obj1[key], obj2[key])
        ) {
          return false;
        }
      }
    }
  } else {
    // compare primitive values
    if (obj1 !== obj2) {
      return false;
    }
  }

  // objects are equal
  return true;
}
