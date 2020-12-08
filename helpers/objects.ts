/**
 * Make a new object which doesn't include specified keys
 */
import {cloneDeepArray} from './arrays';
import {JsonTypes} from '../interfaces/Types';

export function omitObj(obj: {[index: string]: any} | null | undefined, ...keysToExclude: string[]): {[index: string]: any} {
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

export function isPlainObject(obj: any): boolean {
  return obj // not null
    && typeof obj === 'object' // separate from primitives
    && obj.constructor === Object // separate instances (Array, DOM, ...)
    && Object.prototype.toString.call(obj) === '[object Object]' // separate build-in like Math
    || false;
}

/**
 * Merges two objects deeply.
 * It doesn't mutate any object.
 * If you obviously set undefined to one of top's param - it will removes this key from the result object.
 * Arrays will be cloned.
 */
export function mergeDeepObjects(
  top: {[index: string]: any} = {},
  bottom: {[index: string]: any} = {}
): {[index: string]: any} {
  const result: {[index: string]: any} = {};
  const topUndefinedKeys: string[] = [];

  if (typeof top !== 'object' || typeof bottom !== 'object') {
    throw new Error(`mergeDeepObjects: top and bottom has to be objects`);
  }

  // Sort undefined keys.
  // Get only not undefined values to result and collect keys which has a undefined values.
  for (let key of Object.keys(top)) {
    if (typeof top[key] === 'undefined') {
      topUndefinedKeys.push(key);
    }
    else {
      if (Array.isArray(top[key])) {
        result[key] = cloneDeepArray(top[key]);
      }
      else {
        result[key] = top[key];
      }
    }
  }

  for (let key of Object.keys(bottom)) {
    if (!(key in result) && !topUndefinedKeys.includes(key)) {
      // set value which is absent on top but exist on the bottom.
      // only if it obviously doesn't mark as undefined
      if (Array.isArray(bottom[key])) {
        result[key] = cloneDeepArray(bottom[key]);
      }
      else {
        result[key] = bottom[key];
      }
    }
    // go deeper if bottom and top are objects
    else if (isPlainObject(result[key]) && isPlainObject(bottom[key])) {
      result[key] = mergeDeepObjects(result[key], bottom[key]);
    }
    // else - skip
  }

  return result;
}

/**
 * Clone object deeply.
 */
export function cloneDeepObject(obj?: {[index: string]: any}): {[index: string]: any} {
  return mergeDeepObjects({}, obj);
}

// TODO: test
// TODO: copy to squidlet
/**
 * Sort keys of object recursively.
 * Arrays won't be sorted.
 */
export function sortObject(preObj: Record<string, any>): Record<string, any> {
  const sortedKeys = Object.keys(preObj).sort();
  const result: Record<string, any> = {};

  for (let key of sortedKeys) {
    if (Array.isArray(preObj[key])) {
      // don't sort arrays
      result[key] = preObj[key];
    }
    else if (typeof preObj[key] === 'object') {
      // sort recursively
      result[key] = sortObject(preObj[key]);
    }
    else {
      // other primitives
      result[key] = preObj[key];
    }
  }

  return result;
}
