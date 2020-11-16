import {ActionProps} from '../frontend/interfaces/MethodsProps';
import {LOG_LEVELS, LogLevel} from '../frontend/interfaces/Logger';
import {RequestKey} from '../frontend/interfaces/RequestKey';
import {ActionState, ItemState, ListState} from '../frontend/interfaces/MethodsState';


export function makeRequestKey(action: string, props: ActionProps): RequestKey {
  return [
    props.backend || 'default',
    props.set,
    action,
    // TODO: отсортировать query и meta
    JSON.stringify({
      id: props.id,
      query: props.query,
      meta: props.meta,
    })
  ];
}

export function makeListInitialState<T>(): ActionState<T> {
  return {
    loading: false,
    loadedOnce: false,
    lastErrors: null,
    // count: -1,
    // hasNext: false,
    // hasPrev: false,
    // items: null,
  };
}

// export function makeItemInitialState<T>(): ItemState<T> {
//   return {
//     loading: false,
//     loadedOnce: false,
//     lastErrors: null,
//     //item: null,
//   };
// }

/**
 * Makes ['info', 'warn', 'error'] if log level is 'info'
 */
export function calcAllowedLogLevels(logLevel: LogLevel): LogLevel[] {
  const currentLevelIndex: number = LOG_LEVELS.indexOf(logLevel);

  return LOG_LEVELS.slice(currentLevelIndex) as LogLevel[];
}
