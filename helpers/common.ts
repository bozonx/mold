import {ActionProps} from '../frontend/interfaces/ActionProps';
import {LOG_LEVELS, LogLevel} from '../interfaces/Logger';
import {REQUEST_KEY_SEPARATOR, RequestKey} from '../frontend/interfaces/RequestKey';
import {ActionState,} from '../frontend/interfaces/ActionState';
import {DEFAULT_BACKEND} from '../frontend/constants';
import {MoldRequest} from '../interfaces/MoldRequest';
import {omitObj} from './objects';
import {MoldErrorDefinition} from '../interfaces/MoldErrorDefinition';


export function makeRequestKey(props: ActionProps): RequestKey {
  return [
    props.backend || DEFAULT_BACKEND,
    props.set,
    props.action,
    // TODO: отсортировать query
    JSON.stringify({
      id: props.id,
      query: props.query,
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

export function makeInitialActionState(): ActionState {
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
    'isReading'
  ) as Omit<Omit<ActionProps, 'backend'>, 'isReading'>;
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

export function stringifyMoldError(errors?: MoldErrorDefinition[] | null): string {
  if (!errors) return 'Unknown error';

  return errors.map((item) => `${item.code}: ${item.message}`).join(', ');
}

export function combineWhiteAndBlackLists(
  allItems: string[],
  whiteList: string[],
  blackList: string[]
): string[] {
  if (!whiteList.length && !blackList.length) return [];
  // only white
  if (whiteList.length && !blackList.length) {
    // TODO: по хорошему нужно фильтрануть allItems
    return whiteList;
  }
  // only black list
  if (!whiteList.length && blackList.length) {
    const result: string[] = [];
    // TODO: better to use kind of interception function
    for (let item of allItems) {
      if (!blackList.includes(item)) result.push(item);
    }

    return result;
  }

  // and black and white - filter white list
  const result: string[] = [];
  // TODO: по хорошему нужно фильтрануть allItems
  // TODO: better to use kind of interception function
  for (let item of whiteList) {
    if (!blackList.includes(item)) result.push(item);
  }

  return result;
}
