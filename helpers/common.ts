import {ActionProps} from '../frontend/interfaces/MethodsProps';
import {LOG_LEVELS, LogLevel} from '../frontend/interfaces/Logger';
import {REQUEST_KEY_SEPARATOR, RequestKey} from '../frontend/interfaces/RequestKey';
import {ActionState,} from '../frontend/interfaces/MethodsState';


export function makeRequestKey(props: ActionProps): RequestKey {
  return [
    props.backend || 'default',
    props.set,
    props.action,
    // TODO: отсортировать query и meta
    JSON.stringify({
      id: props.id,
      query: props.query,
      meta: props.meta,
    })
  ];
}

export function requestKeyToString(requestKey: RequestKey): string {
  return requestKey.join(REQUEST_KEY_SEPARATOR);
}

export function splitInstanceId(
  instanceId: string
): {requestKey: RequestKey, instanceNum: string} {
  const splat: string[] = instanceId.split(REQUEST_KEY_SEPARATOR);
  const instanceNum: string = splat[splat.length - 1];

  splat.pop();

  return {requestKey: splat as RequestKey, instanceNum};
}

export function makeInitialState(): ActionState {
  return {
    pending: false,
    finishedOnce: false,
    responseStatus: null,
    responseErrors: null,
    result: null,
  };
}

/**
 * Makes ['info', 'warn', 'error'] if log level is 'info'
 */
export function calcAllowedLogLevels(logLevel: LogLevel): LogLevel[] {
  const currentLevelIndex: number = LOG_LEVELS.indexOf(logLevel);

  return LOG_LEVELS.slice(currentLevelIndex) as LogLevel[];
}

export function isPromise(toCheck: any): boolean {
  return toCheck
    && typeof toCheck === 'object'
    && typeof toCheck.then === 'function'
    || false;
}
