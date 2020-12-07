import {ActionProps} from '../frontend/interfaces/ActionProps';
import {REQUEST_KEY_SEPARATOR, RequestKey} from '../frontend/interfaces/RequestKey';
import {DEFAULT_BACKEND} from '../frontend/constants';
import {omitObj, omitUndefined, sortObject} from './objects';
import {ActionState} from '../frontend/interfaces/ActionState';
import {MoldRequest} from '../interfaces/MoldRequest';
import {MoldErrorDefinition} from '../interfaces/MoldErrorDefinition';


export function makeRequestKey(props: ActionProps): RequestKey {
  return [
    props.backend || DEFAULT_BACKEND,
    props.set,
    props.action,
    JSON.stringify(props.query && sortObject(props.query)),
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

export function makeRequest(
  actionProps: ActionProps,
  dataOverride?: Record<string, any>,
  //queryOverride?: Record<string, any>
): MoldRequest {
  return omitUndefined({
    ...omitObj(actionProps,'backend', 'isReading'),
    data: (actionProps.data || dataOverride) && {
      ...actionProps.data,
      ...dataOverride,
    },
    // query: (actionProps.query || queryOverride) && {
    //   ...actionProps.query,
    //   ...queryOverride,
    // },
  }) as Omit<Omit<ActionProps, 'backend'>, 'isReading'>;
}

export function stringifyMoldError(errors?: MoldErrorDefinition[] | null): string {
  if (!errors) return 'Unknown error';

  return errors.map((item) => `${item.code}: ${item.message}`).join(', ');
}
