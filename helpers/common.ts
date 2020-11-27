import {ActionProps} from '../frontend/interfaces/MethodsProps';
import {LOG_LEVELS, LogLevel} from '../interfaces/Logger';
import {REQUEST_KEY_SEPARATOR, RequestKey} from '../frontend/interfaces/RequestKey';
import {ActionState,} from '../frontend/interfaces/MethodsState';
import {DEFAULT_BACKEND} from '../frontend/constants';
import MoldRequest from '../interfaces/MoldRequest';
import {omitObj} from './objects';
import {MoldErrorDefinition} from '../interfaces/MoldErrorDefinition';


export function makeRequestKey(props: ActionProps): RequestKey {
  return [
    props.backend || DEFAULT_BACKEND,
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
    success: null,
    status: null,
    errors: null,
    result: null,
  };
}

export function makeRequest(props: ActionProps): MoldRequest {
  return omitObj(
    props,
    'backend',
    'isGetting'
  ) as MoldRequest;
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

export function stringifyError(errors?: MoldErrorDefinition[] | null): string {
  if (!errors) return 'Unknown error';

  return errors.map((item) => `${item.code}: ${item.message}`).join(', ');
}
