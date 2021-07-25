import {LOG_LEVELS, LogLevel} from '../interfaces/Logger'


// TODO: move to squidled-lib
/**
 * Makes ['info', 'warn', 'error'] if log level is 'info'
 */
export function calcAllowedLogLevels(logLevel: LogLevel): LogLevel[] {
  const currentLevelIndex: number = LOG_LEVELS.indexOf(logLevel)

  return LOG_LEVELS.slice(currentLevelIndex) as LogLevel[]
}

// TODO: move to squidled-lib
export function isPromise(toCheck: any): boolean {
  return toCheck
    && typeof toCheck === 'object'
    && typeof toCheck.then === 'function'
    || false
}

export function convertPageToOffset(
  page?: number,
  pageSize?: number
): { limit?: number, skip?: number } {
  if (!page || page < 0 || !pageSize || pageSize < 0) return {}

  return {
    limit: pageSize,
    skip: (page - 1) * pageSize,
  }
}

// TODO: move to squidled-lib
export function filterBlackList(allItems: string[], blackList: string[] = []): string[] {
  if (!blackList || !blackList.length) return allItems

  let whiteList: string[] = []

  // TODO: better to use kind of interception function
  for (let item of allItems) {
    if (!blackList.includes(item)) whiteList.push(item)
  }

  return whiteList
}


// export function combineWhiteAndBlackLists(
//   allItems: string[],
//   whiteList: string[],
//   blackList: string[]
// ): string[] {
//   if (!whiteList.length && !blackList.length) return [];
//   // only white
//   if (whiteList.length && !blackList.length) {
//     // TODO: по хорошему нужно фильтрануть allItems
//     return whiteList;
//   }
//   // only black list
//   if (!whiteList.length && blackList.length) {
//     const result: string[] = [];
//     // TODO: better to use kind of interception function
//     for (let item of allItems) {
//       if (!blackList.includes(item)) result.push(item);
//     }
//
//     return result;
//   }
//
//   // and black and white - filter white list
//   const result: string[] = [];
//   // TODO: по хорошему нужно фильтрануть allItems
//   // TODO: better to use kind of interception function
//   for (let item of whiteList) {
//     if (!blackList.includes(item)) result.push(item);
//   }
//
//   return result;
// }
