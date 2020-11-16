/**
 * Make a new object which doesn't include specified keys
 */
export function omitObj(obj: {[index: string]: any} | undefined, ...keysToExclude: string[]): {[index: string]: any} {
  if (!obj) return {};

  const result: {[index: string]: any} = {};

  for (let key of Object.keys(obj)) {
    if (keysToExclude.indexOf(key) < 0) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * It creates a new object which doesn't include keys which values are undefined.
 */
export function omitUndefined(obj: {[index: string]: any} | undefined): {[index: string]: any} {
  if (!obj) return {};

  const result: {[index: string]: any} = {};

  for (let key of Object.keys(obj)) {
    if (typeof obj[key] === 'undefined') continue;

    result[key] = obj[key];
  }

  return result;
}

/**
 * Check is object is empty.
 * For other types it will return true.
 * Null means an empty object too. Better is not to use null.
 */
export function isEmptyObject(toCheck: {[index: string]: any} = {}): boolean {
  if (typeof toCheck !== 'object' || Array.isArray(toCheck)) {
    return true;
  }

  return !Object.keys(toCheck || {}).length;
}
