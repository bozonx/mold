import {ActionProps} from '../frontend/interfaces/ActionProps';
import {cloneDeepObject, omitObj, omitUndefined} from 'squidlet-lib/src/objects';
import {ActionState} from '../frontend/interfaces/ActionState';
import {MoldRequest, MoldRequestData} from '../interfaces/MoldRequest'
import {MoldErrorDefinition} from '../interfaces/MoldErrorDefinition';
import {MoldResponse} from '../interfaces/MoldResponse';
import {REQUEST_STATUSES} from '../shared/constants';
import {JsonTypes} from '../interfaces/Types'


export function makeInitialActionState(props: ActionProps): ActionState {
  return {
    pending: false,
    finishedOnce: false,
    success: null,
    status: null,
    errors: null,
    result: null,
    $props: props,
  }
}

export function makeRequest(
  actionProps: ActionProps,
  dataOverride?: MoldRequestData,
  queryOverride?: Record<string, JsonTypes>
): MoldRequest {
  return omitUndefined({
    ...cloneDeepObject(omitObj(actionProps,'backend', 'isReading', 'data', 'query')),
    data: (actionProps.data || dataOverride) && {
      ...cloneDeepObject(actionProps.data),
      ...cloneDeepObject(dataOverride),
    },
    query: (actionProps.query || queryOverride) && {
      ...actionProps.query,
      ...queryOverride,
    },
  }) as Omit<Omit<ActionProps, 'backend'>, 'isReading'>
}

export function makeFatalErrorResponse(err: Error | string): MoldResponse {
  return {
    success: false,
    status: REQUEST_STATUSES.fatalError,
    errors: [{code: REQUEST_STATUSES.fatalError, message: String(err)}],
    result: null,
  };
}

// TODO: remove ???
export function stringifyMoldError(errors?: MoldErrorDefinition[] | null): string {
  if (!errors) return 'Unknown error';

  return errors.map((item) => `${item.code}: ${item.message}`).join(', ');
}
