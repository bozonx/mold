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
