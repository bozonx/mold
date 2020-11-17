import {cloneDeepObject} from './objects';


export function cloneDeepArray(arr?: any[]): any[] {
  if (!arr) return [];

  const result: any[] = [];

  for (let item of arr) {
    if (Array.isArray(item)) {
      // go deeper
      result.push(cloneDeepArray(item));
    }
    else if (typeof item === 'object') {
      // clone object
      result.push(cloneDeepObject(item));
    }
    else {
      result.push(item);
    }
  }

  return result;
}
